import json
from datetime import date
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Student, MoodCheckin, RiskAssessment, Alert, Intervention, User
from .views import require_auth, require_role
from .engine import calculate_student_risk, run_risk_engine_for_all

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def list_students(request):
    """GET /api/students"""
    students = Student.objects.all()
    
    # Simple filtering
    risk_band = request.GET.get('risk_band')
    if risk_band:
        students = students.filter(risk_band=risk_band)
    
    department = request.GET.get('department')
    if department:
        students = students.filter(department=department)

    year = request.GET.get('year')
    if year:
        students = students.filter(year=year)
        
    data = []
    for s in students:
        data.append({
            'id': str(s.id),
            'name': s.name,
            'roll_number': s.roll_number,
            'department': s.department,
            'year': s.year,
            'current_risk_score': s.current_risk_score,
            'risk_band': s.risk_band
        })
    return JsonResponse({'students': data})

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def student_detail(request, student_id):
    """GET /api/students/<id>"""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

    # Academic trend
    academics = []
    for a in student.academic_records.order_by('semester'):
        academics.append({
            'semester': a.semester,
            'gpa': a.gpa,
            'attendance_percentage': a.attendance_percentage,
            'active_backlogs': a.active_backlogs
        })

    # Mood history
    moods = []
    for m in student.mood_checkins.order_by('-date')[:10]:
        moods.append({
            'date': m.date.isoformat(),
            'mood_score': m.mood_score,
            'sleep_hours': m.sleep_hours,
            'stress_level': m.stress_level,
            'notes': m.notes
        })
        
    # Behavioral timeline
    behaviors = []
    for b in student.behavioral_logs.order_by('-date')[:10]:
        behaviors.append({
            'date': b.date.isoformat(),
            'activity_type': b.activity_type,
            'severity': b.severity,
            'notes': b.notes
        })

    latest_risk = student.risk_assessments.order_by('-created_at').first()
    risk_data = None
    if latest_risk:
        risk_data = {
            'total_risk_score': latest_risk.total_risk_score,
            'risk_level': latest_risk.risk_level,
            'factors': latest_risk.contributing_factors,
            'explanation': latest_risk.explanation,
            'assessed_at': latest_risk.created_at.isoformat()
        }

    return JsonResponse({
        'student': {
            'id': str(student.id),
            'name': student.name,
            'roll_number': student.roll_number,
            'department': student.department,
            'year': student.year,
            'contact_number': student.contact_number,
            'parent_contact': student.parent_contact,
        },
        'latest_risk': risk_data,
        'academics': academics,
        'moods': moods,
        'behaviors': behaviors
    })

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def student_risk_history(request, student_id):
    """GET /api/students/<id>/risk-history"""
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
        
    assessments = student.risk_assessments.order_by('-created_at')[:20]
    data = []
    for a in assessments:
        data.append({
            'id': str(a.id),
            'total_risk_score': a.total_risk_score,
            'risk_level': a.risk_level,
            'created_at': a.created_at.isoformat()
        })
    return JsonResponse({'history': data})

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
@require_role(['student'])
def mood_checkin(request):
    """POST /api/mood-checkin 
       Student submitting their own check-in
    """
    try:
        data = json.loads(request.body)
        mood_score = int(data.get('mood_score', 5))
        sleep_hours = float(data.get('sleep_hours', 7.0))
        stress_level = int(data.get('stress_level', 5))
        notes = data.get('notes', '')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    student = request.user.profile.linked_student
    if not student:
        return JsonResponse({'error': 'No linked student found'}, status=400)

    MoodCheckin.objects.create(
        student=student,
        date=date.today(),
        mood_score=mood_score,
        sleep_hours=sleep_hours,
        stress_level=stress_level,
        notes=notes
    )

    # Recompute risk immediately for immediate feedback/alerting
    score, band, factors, explanation = calculate_student_risk(student)
    student.current_risk_score = score
    student.risk_band = band
    student.save()
    
    # Store Risk Assessment
    RiskAssessment.objects.create(
        student=student, total_risk_score=score, risk_level=band,
        contributing_factors=factors, explanation=explanation
    )
    
    # Alert logic
    if band in ['high', 'critical']:
        has_active = Alert.objects.filter(student=student, is_resolved=False).exists()
        if not has_active:
             Alert.objects.create(
                 student=student,
                 alert_type=f'risk_level_{band}',
                 message=f"Check-in triggered risk increase: {band.upper()} ({score}/100).\nDetails: {explanation}"
             )

    return JsonResponse({'status': 'ok', 'message': 'Check-in saved'})

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
@require_role(['admin'])
def compute_risk(request):
    """POST /api/risk/compute"""
    try:
        run_risk_engine_for_all()
        return JsonResponse({'status': 'ok', 'message': 'Batch compute completed'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def list_alerts(request):
    """GET /api/alerts"""
    alerts = Alert.objects.all().select_related('student').order_by('-created_at')
    
    is_resolved_param = request.GET.get('is_resolved')
    if is_resolved_param is not None:
        is_resolved = is_resolved_param.lower() == 'true'
        alerts = alerts.filter(is_resolved=is_resolved)
        
    data = []
    for a in alerts:
        data.append({
            'id': str(a.id),
            'student_id': str(a.student.id),
            'student_name': a.student.name,
            'alert_type': a.alert_type,
            'message': a.message,
            'is_resolved': a.is_resolved,
            'created_at': a.created_at.isoformat()
        })
    return JsonResponse({'alerts': data})

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
@require_role(['admin', 'counsellor'])
def acknowledge_alert(request, alert_id):
    """POST /api/alerts/<id>/acknowledge"""
    try:
        alert = Alert.objects.get(id=alert_id)
        alert.is_resolved = True
        alert.save()
        return JsonResponse({'status': 'ok', 'message': 'Alert acknowledged'})
    except Alert.DoesNotExist:
        return JsonResponse({'error': 'Alert not found'}, status=404)

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def list_interventions(request):
    """GET /api/interventions"""
    qs = Intervention.objects.all().select_related('student', 'counsellor').order_by('-created_at')
    status = request.GET.get('status')
    if status:
        qs = qs.filter(status=status)
        
    data = []
    for i in qs:
        data.append({
            'id': str(i.id),
            'student_name': i.student.name,
            'student_id': str(i.student.id),
            'counsellor': i.counsellor.username if i.counsellor else None,
            'status': i.status,
            'notes': i.notes,
            'scheduled_date': i.scheduled_date.isoformat() if i.scheduled_date else None,
            'created_at': i.created_at.isoformat()
        })
    return JsonResponse({'interventions': data})

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
@require_role(['admin', 'counsellor'])
def create_intervention(request):
    """POST /api/interventions"""
    try:
        data = json.loads(request.body)
        student_id = data.get('student_id')
        status = data.get('status', 'pending')
        notes = data.get('notes', '')
        # Simple string for date is fine for hackathon
        scheduled_date_str = data.get('scheduled_date', None) 
        
        student = Student.objects.get(id=student_id)
        
        counsellor = request.user
        
        interv = Intervention.objects.create(
            student=student,
            counsellor=counsellor,
            status=status,
            notes=notes,
            # would parse date string in real scenario, omitting for safety if None
        )
        return JsonResponse({'status': 'ok', 'id': str(interv.id)})
    except Exception as e:
         return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'counsellor'])
def ai_recommendations(request, student_id):
    """GET /api/recommendations/<student_id>
       Synthetic AI Recommendations endpoint based on rule engine output
    """
    try:
        student = Student.objects.get(id=student_id)
        latest_risk = student.risk_assessments.order_by('-created_at').first()
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

    recommendations = []
    if latest_risk and latest_risk.contributing_factors:
        factors = latest_risk.contributing_factors
        if 'attendance_drop' in factors:
            recommendations.append({
                'priority': 'High',
                'reason': 'Critically low attendance',
                'action_item': 'Contact student mentor to schedule a fast-track course catch-up plan.'
            })
        if 'gpa_drop' in factors:
            recommendations.append({
                'priority': 'Medium',
                'reason': 'Significant GPA drop flagged',
                'action_item': 'Assign TA for peer tutoring sessions.'
            })
        if 'sleep_deprivation' in factors or 'high_stress' in factors:
             recommendations.append({
                'priority': 'High',
                'reason': 'Wellbeing/Stress indicators are alarming',
                'action_item': 'Book mandatory check-in with the campus psychological counsellor.'
            })
        if 'disengagement' in factors or 'meals_skipped' in factors:
            recommendations.append({
                'priority': 'Medium',
                'reason': 'Signs of isolation (Skipping meals/Library)',
                'action_item': 'Have residence warden casually check on student at hostel room.'
            })

    if not recommendations:
        recommendations.append({
            'priority': 'Low',
            'reason': 'Student is stable',
            'action_item': 'Continue standard monitoring.'
        })

    return JsonResponse({'recommendations': recommendations})
