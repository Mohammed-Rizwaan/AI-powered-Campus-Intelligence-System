from django.contrib import admin
from .models import (
    Student, Profile, AcademicRecord, BehavioralLog, MoodCheckin,
    RiskAssessment, Alert, Intervention, HostelBlock, Room,
    RoomAllocation, ResourceUsage
)

# Register your models here.

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'linked_student')
    search_fields = ('user__username', 'role')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'roll_number', 'department', 'year', 'current_risk_score', 'risk_band')
    search_fields = ('name', 'roll_number')
    list_filter = ('department', 'year', 'risk_band')

@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'semester', 'gpa', 'attendance_percentage', 'active_backlogs')
    list_filter = ('semester',)

@admin.register(BehavioralLog)
class BehavioralLogAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'activity_type', 'severity')
    list_filter = ('severity', 'date')

@admin.register(MoodCheckin)
class MoodCheckinAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'mood_score')
    list_filter = ('mood_score', 'date')

@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'total_risk_score', 'risk_level', 'created_at')
    list_filter = ('risk_level',)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('student', 'alert_type', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'alert_type')
    search_fields = ('student__name', 'message')

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ('student', 'counsellor', 'status', 'scheduled_date')
    list_filter = ('status',)

@admin.register(HostelBlock)
class HostelBlockAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity')

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('block', 'room_number', 'capacity')
    list_filter = ('block',)

@admin.register(RoomAllocation)
class RoomAllocationAdmin(admin.ModelAdmin):
    list_display = ('room', 'student', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active',)

@admin.register(ResourceUsage)
class ResourceUsageAdmin(admin.ModelAdmin):
    list_display = ('location', 'resource_type', 'quantity', 'timestamp')
    list_filter = ('resource_type', 'location')
