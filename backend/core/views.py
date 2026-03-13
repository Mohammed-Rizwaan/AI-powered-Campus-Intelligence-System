import json
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.core import signing
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Profile

# -----------------------------------------------------------------
# Authentication Utility Functions
# -----------------------------------------------------------------
def generate_token(user):
    """Generate a simple signed token valid for 1 day."""
    return signing.dumps({'user_id': user.id})

def get_user_from_token(request):
    """Extract and verify token from Bearer header."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        data = signing.loads(token, max_age=86400) # Valid for 24 hours
        from django.contrib.auth.models import User
        return User.objects.get(id=data['user_id'])
    except Exception:
        return None

def require_auth(view_func):
    """Decorator to enforce valid authentication token."""
    def wrapped_view(request, *args, **kwargs):
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Unauthorized. Invalid or missing token.'}, status=401)
        request.user = user
        return view_func(request, *args, **kwargs)
    return wrapped_view

def require_role(allowed_roles):
    """Decorator to enforce specific roles based on the user's Profile."""
    def decorator(view_func):
        @require_auth
        def wrapped_view(request, *args, **kwargs):
            try:
                profile = request.user.profile
                if profile.role not in allowed_roles:
                    return JsonResponse({'error': f'Forbidden: Requires one of {allowed_roles}'}, status=403)
            except Profile.DoesNotExist:
                return JsonResponse({'error': 'Forbidden: User has no assigned role profile'}, status=403)
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


# -----------------------------------------------------------------
# API Auth Endpoints
# -----------------------------------------------------------------
@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """
    POST /api/auth/login
    Accepts JSON body with {"username": "...", "password": "..."}
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    user = authenticate(username=username, password=password)
    
    if user is not None:
        try:
            profile = user.profile
            role = profile.role
            name = profile.linked_student.name if profile.linked_student else user.username
        except Profile.DoesNotExist:
            role = 'unknown'
            name = user.username

        token = generate_token(user)
        return JsonResponse({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'name': name,
                'role': role
            }
        })
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)


@require_http_methods(["GET"])
@require_auth
def me_view(request):
    """
    GET /api/auth/me
    Requires Authorization: Bearer <token>
    """
    user = request.user
    try:
        profile = user.profile
        role = profile.role
        name = profile.linked_student.name if profile.linked_student else user.username
        student_data = None
        if profile.linked_student:
             student_data = {
                 'student_id': str(profile.linked_student.id),
                 'roll_number': profile.linked_student.roll_number,
                 'department': profile.linked_student.department,
                 'current_risk_score': profile.linked_student.current_risk_score,
                 'risk_band': profile.linked_student.risk_band
             }
    except Profile.DoesNotExist:
        role = 'unknown'
        name = user.username
        student_data = None

    return JsonResponse({
        'user': {
            'id': user.id,
            'username': user.username,
            'name': name,
            'role': role,
            'student_context': student_data
        }
    })
