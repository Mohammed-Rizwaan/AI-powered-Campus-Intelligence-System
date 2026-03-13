import json
from datetime import datetime, timedelta, date
from django.db.models import Sum, Avg, Count
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import HostelBlock, Room, RoomAllocation, ResourceUsage
from .views import require_auth, require_role

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def list_hostels(request):
    """GET /api/hostels"""
    blocks = HostelBlock.objects.all()
    data = []
    for b in blocks:
        # Calculate current capacity filled
        total_capacity = b.capacity
        allocated_rooms = RoomAllocation.objects.filter(room__block=b, is_active=True).count()
        # The number of allocated_rooms is the number of active allocations
        occupancy_rate = 0
        if total_capacity > 0:
            occupancy_rate = round((allocated_rooms / total_capacity) * 100, 2)
            
        data.append({
            'id': str(b.id),
            'name': b.name,
            'capacity': total_capacity,
            'currently_allocated': allocated_rooms,
            'occupancy_rate': occupancy_rate,
            'status': 'Overloaded' if occupancy_rate > 90 else 'Underutilized' if occupancy_rate < 60 else 'Optimal'
        })
    return JsonResponse({'hostel_blocks': data})

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def list_rooms(request, block_id):
    """GET /api/hostels/<id>/rooms"""
    try:
        block = HostelBlock.objects.get(id=block_id)
    except HostelBlock.DoesNotExist:
        return JsonResponse({'error': 'Block not found'}, status=404)
        
    rooms = Room.objects.filter(block=block).prefetch_related('allocations')
    data = []
    for r in rooms:
        active_allocs = r.allocations.filter(is_active=True).count()
        data.append({
            'id': str(r.id),
            'room_number': r.room_number,
            'capacity': r.capacity,
            'allocated': active_allocs,
            'is_full': active_allocs >= r.capacity
        })
    return JsonResponse({'block_name': block.name, 'rooms': data})

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def allocation_suggestions(request):
    """GET /api/hostels/allocation-suggestions"""
    blocks = HostelBlock.objects.all()
    overloaded = []
    underutilized = []
    
    for b in blocks:
        alloc_count = RoomAllocation.objects.filter(room__block=b, is_active=True).count()
        occupancy_rate = 0
        if b.capacity > 0:
            occupancy_rate = (alloc_count / b.capacity) * 100
            
        if occupancy_rate > 90:
            excess = alloc_count - int(b.capacity * 0.85) # target 85%
            overloaded.append({'block_id': str(b.id), 'name': b.name, 'excess_students': excess, 'occupancy': round(occupancy_rate, 1)})
        elif occupancy_rate < 60:
            available = int(b.capacity * 0.85) - alloc_count
            underutilized.append({'block_id': str(b.id), 'name': b.name, 'available_slots': available, 'occupancy': round(occupancy_rate, 1)})
            
    suggestions = []
    if overloaded and underutilized:
        for ov in overloaded:
            # Simple greedy match
            for un in underutilized:
                if un['available_slots'] > 0 and ov['excess_students'] > 0:
                    transfer_count = min(ov['excess_students'], un['available_slots'])
                    suggestions.append({
                        'action': 'transfer',
                        'from_block': ov['name'],
                        'to_block': un['name'],
                        'student_count': transfer_count,
                        'reason': f"Rebalance {ov['name']} ({ov['occupancy']}% full) by moving {transfer_count} students to {un['name']} ({un['occupancy']}% full)."
                    })
                    ov['excess_students'] -= transfer_count
                    un['available_slots'] -= transfer_count

    if not suggestions:
        suggestions.append({
            'action': 'none',
            'reason': 'Hostel occupancy is currently balanced across blocks.'
        })

    return JsonResponse({
        'status': 'success',
        'overloaded_blocks': overloaded,
        'underutilized_blocks': underutilized,
        'suggestions': suggestions
    })

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def resource_usage(request):
    """GET /api/resources/usage?facility_type=energy&days=7"""
    facility_type = request.GET.get('facility_type')
    days = int(request.GET.get('days', 7))
    start_date = datetime.now() - timedelta(days=days)
    
    qs = ResourceUsage.objects.filter(timestamp__gte=start_date).order_by('timestamp')
    if facility_type:
        qs = qs.filter(resource_type=facility_type)
        
    data = []
    for u in qs:
        data.append({
            'id': str(u.id),
            'location': u.location,
            'resource_type': u.resource_type,
            'quantity': u.quantity,
            'timestamp': u.timestamp.isoformat()
        })
    return JsonResponse({'usage': data})

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def resource_insights(request):
    """GET /api/resources/insights"""
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    insights = []
    # Mess Insight
    mess_usage = ResourceUsage.objects.filter(resource_type='mess', timestamp__gte=thirty_days_ago)
    if mess_usage.exists():
        # Heuristic: Compare weekend vs weekday
        total_weekday = 0; weekday_count = 0
        total_weekend = 0; weekend_count = 0
        
        for m in mess_usage:
            if m.timestamp.weekday() >= 5: # Sat, Sun
                total_weekend += m.quantity
                weekend_count += 1
            else:
                total_weekday += m.quantity
                weekday_count += 1
                
        if weekday_count > 0 and weekend_count > 0:
            avg_weekday = total_weekday / weekday_count
            avg_weekend = total_weekend / weekend_count
            if avg_weekend < avg_weekday * 0.7:
                 insights.append({
                     'category': 'Mess',
                     'insight': f"Weekend mess consumption ({round(avg_weekend)} meals) is {(1 - avg_weekend/avg_weekday)*100:.0f}% lower than weekdays ({round(avg_weekday)} meals).",
                     'recommendation': "Optimize weekend dry-store procurement and reduce chef staffing by 30% on Saturdays and Sundays.",
                     'potential_saving': 'High'
                 })

    if not insights:
        insights.append({'category': 'General', 'insight': 'Resource consumption is optimal.', 'recommendation': 'Continue monitoring.'})
        
    return JsonResponse({'insights': insights})

@require_http_methods(["GET"])
@require_auth
@require_role(['admin', 'warden'])
def energy_alerts(request):
    """GET /api/resources/energy-alerts
       Detects anomalies (e.g., high Lab-3 usage off-hours)
    """
    recent_usage = ResourceUsage.objects.filter(resource_type='energy', timestamp__gte=datetime.now() - timedelta(days=14))
    alerts = []
    
    for usage in recent_usage:
        hour = usage.timestamp.hour
        # Heuristic: If it's between 12 AM (0) and 5 AM (5) and energy > 50 kWh
        if 0 <= hour <= 5 and usage.quantity > 50.0:
            alerts.append({
                'id': str(usage.id),
                'location': usage.location,
                'timestamp': usage.timestamp.isoformat(),
                'quantity': usage.quantity,
                'anomaly_description': f"CRITICAL SPIKE: High energy usage ({usage.quantity} kWh) detected during off-hours ({hour}:00 AM).",
                'action_required': "Dispatch security to visually inspect location for unpowered or left-on equipment."
            })
            
    # Sort alerts by newest first
    alerts = sorted(alerts, key=lambda x: x['timestamp'], reverse=True)
    
    return JsonResponse({'energy_alerts': alerts})
