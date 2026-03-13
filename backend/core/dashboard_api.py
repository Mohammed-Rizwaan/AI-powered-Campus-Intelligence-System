from datetime import datetime, timedelta, date
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Student, RiskAssessment, Alert, Intervention, HostelBlock, RoomAllocation, ResourceUsage, MoodCheckin
from .views import require_auth, require_role

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor', 'warden'])
def dashboard_summary(request):
    """GET /api/dashboard/summary
       Top-level KPIs for the Admin/Overview dashboard.
    """
    total_students = Student.objects.count()
    at_risk_count = Student.objects.filter(risk_band__in=['high', 'critical']).count()
    active_alerts = Alert.objects.filter(is_resolved=False).count()
    pending_interventions = Intervention.objects.filter(status='pending').count()
    
    # Global occupancy
    total_capacity = HostelBlock.objects.aggregate(Sum('capacity'))['capacity__sum'] or 0
    total_allocated = RoomAllocation.objects.filter(is_active=True).count()
    occupancy_rate = 0
    if total_capacity > 0:
        occupancy_rate = round((total_allocated / total_capacity) * 100, 1)

    return JsonResponse({
        'kpis': {
            'total_students': total_students,
            'students_at_risk': at_risk_count,
            'active_alerts': active_alerts,
            'pending_interventions': pending_interventions,
            'global_occupancy_rate': occupancy_rate
        }
    })


@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def wellbeing_overview(request):
    """GET /api/dashboard/wellbeing-overview
       Data formatted specifically for Chart.js
    """
    # 1. Risk distribution (Doughnut Chart)
    distribution = list(Student.objects.values('risk_band').annotate(count=Count('id')).order_by('risk_band'))
    
    # Ensure all bands exist in data
    band_counts = {'low': 0, 'moderate': 0, 'high': 0, 'critical': 0}
    for d in distribution:
        band = d['risk_band']
        if band in band_counts:
            band_counts[band] = d['count']

    # 2. Top risk factors frequency (Bar Chart)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_assessments = RiskAssessment.objects.filter(created_at__gte=thirty_days_ago)
    
    factor_counts = {}
    for assessment in recent_assessments:
        if assessment.contributing_factors:
            for factor_key in assessment.contributing_factors.keys():
                factor_counts[factor_key] = factor_counts.get(factor_key, 0) + 1
                
    # Sort and take top 5
    top_factors = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    # 3. 30-day Risk Trend (Line Chart)
    # Average Risk Score per day
    trend_data = (
        RiskAssessment.objects.filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(avg_score=Avg('total_risk_score'))
        .order_by('date')
    )
    
    trend_dates = []
    trend_scores = []
    for t in trend_data:
        trend_dates.append(t['date'].isoformat())
        trend_scores.append(round(t['avg_score'], 1))

    return JsonResponse({
        'risk_distribution': {
            'labels': ['Low', 'Moderate', 'High', 'Critical'],
            'data': [band_counts['low'], band_counts['moderate'], band_counts['high'], band_counts['critical']]
        },
        'top_risk_factors': {
            'labels': [f[0] for f in top_factors],
            'data': [f[1] for f in top_factors]
        },
        'risk_trend_30_days': {
            'labels': trend_dates,
            'data': trend_scores
        }
    })

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def resource_overview(request):
    """GET /api/dashboard/resource-overview
       Hostel and Resource optimization charts
    """
    # 1. Hostel Occupancy Comparison (Bar Chart)
    blocks = HostelBlock.objects.all()
    block_labels = []
    block_occupancy = []
    
    for b in blocks:
        allocated = RoomAllocation.objects.filter(room__block=b, is_active=True).count()
        rate = (allocated / b.capacity) * 100 if b.capacity > 0 else 0
        block_labels.append(b.name)
        block_occupancy.append(round(rate, 1))

    # 2. Energy Usage Trend (last 7 days - Line Chart)
    seven_days_ago = datetime.now() - timedelta(days=7)
    energy_trend = (
        ResourceUsage.objects.filter(resource_type='energy', timestamp__gte=seven_days_ago)
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(daily_total=Sum('quantity'))
        .order_by('date')
    )
    
    energy_dates = []
    energy_totals = []
    for e in energy_trend:
        energy_dates.append(e['date'].isoformat())
        energy_totals.append(round(e['daily_total'], 1))

    # 3. Pending Anomalies / Alerts count
    # Detect off-hours energy anomalies specifically acting as an alert count
    anomaly_count = ResourceUsage.objects.filter(
        resource_type='energy',
        timestamp__gte=seven_days_ago,
        quantity__gt=50.0,
        timestamp__hour__lte=5 # Midnight to 5 AM
    ).count()

    return JsonResponse({
        'hostel_occupancy': {
            'labels': block_labels,
            'data': block_occupancy
        },
        'energy_trend_7_days': {
            'labels': energy_dates,
            'data': energy_totals
        },
        'pending_resource_alerts': anomaly_count
    })

@require_http_methods(["GET"])
@require_auth
@require_role(['student'])
def student_home(request):
    """GET /api/dashboard/student-home
       Personalized dashboard for the student themselves.
    """
    student = request.user.profile.linked_student
    if not student:
        return JsonResponse({'error': 'No linked student profile'}, status=400)

    # Latest Risk
    latest_score = student.current_risk_score
    risk_band = student.risk_band
    
    # Recent Mood Chart
    recent_moods = student.mood_checkins.order_by('-date')[:7]
    mood_dates = []
    mood_scores = []
    for m in reversed(recent_moods): # Chronological order
        mood_dates.append(m.date.isoformat())
        mood_scores.append(m.mood_score)

    # Room Info
    allocation = student.room_allocations.filter(is_active=True).first()
    room_info = None
    if allocation:
        room_info = {
            'block': allocation.room.block.name,
            'room': allocation.room.room_number
        }

    # Recommended Action (Friendly for student)
    action = "You are doing great! Keep it up."
    if risk_band == 'critical':
        action = "Please reach out to the counseling center immediately. We are here to help."
    elif risk_band == 'high':
        action = "We noticed some recent drops in your metrics. Consider talking to your mentor."
    elif risk_band == 'moderate':
        action = "Your stress levels might be increasing. Remember to take a break and rest."

    return JsonResponse({
        'personal_status': {
            'name': student.name,
            'current_score': latest_score,
            'band': risk_band,
            'recommended_action': action
        },
        'room_allocation': room_info,
        'mood_trend': {
            'labels': mood_dates,
            'data': mood_scores
        }
    })
