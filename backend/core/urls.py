from django.urls import path
from . import views
from . import api
from . import hostel_api
from . import dashboard_api

urlpatterns = [
    # Auth
    path('auth/login', views.login_view, name='api_login'),
    path('auth/me', views.me_view, name='api_me'),

    # Wellbeing / Students
    path('students', api.list_students, name='api_students_list'),
    path('students/<uuid:student_id>', api.student_detail, name='api_student_detail'),
    path('students/<uuid:student_id>/risk-history', api.student_risk_history, name='api_student_risk_history'),
    
    # Checkins & Compute
    path('mood-checkin', api.mood_checkin, name='api_mood_checkin'),
    path('risk/compute', api.compute_risk, name='api_compute_risk'),

    # Alerts
    path('alerts', api.list_alerts, name='api_list_alerts'),
    path('alerts/<uuid:alert_id>/acknowledge', api.acknowledge_alert, name='api_ack_alert'),

    # Interventions
    path('interventions', api.list_interventions, name='api_list_interventions'),
    path('interventions/create', api.create_intervention, name='api_create_intervention'),

    # AI Recommendations
    path('recommendations/<uuid:student_id>', api.ai_recommendations, name='api_ai_recommendations'),

    # Hostels & Resources
    path('hostels', hostel_api.list_hostels, name='api_hostels_list'),
    path('hostels/<uuid:block_id>/rooms', hostel_api.list_rooms, name='api_hostels_rooms'),
    path('hostels/allocation-suggestions', hostel_api.allocation_suggestions, name='api_allocation_suggestions'),
    path('resources/usage', hostel_api.resource_usage, name='api_resource_usage'),
    path('resources/insights', hostel_api.resource_insights, name='api_resource_insights'),
    path('resources/energy-alerts', hostel_api.energy_alerts, name='api_energy_alerts'),

    # Dashboards (KPIs & Aggregates)
    path('dashboard/summary', dashboard_api.dashboard_summary, name='api_dashboard_summary'),
    path('dashboard/wellbeing-overview', dashboard_api.wellbeing_overview, name='api_dashboard_wellbeing'),
    path('dashboard/resource-overview', dashboard_api.resource_overview, name='api_dashboard_resource'),
    path('dashboard/student-home', dashboard_api.student_home, name='api_dashboard_student_home'),
]
