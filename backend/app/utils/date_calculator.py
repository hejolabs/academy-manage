from datetime import date, timedelta
from typing import List

def calculate_session_end_date(
    start_date: date, 
    total_sessions: int, 
    exclude_weekends: bool = True,
    holidays: List[date] = None
) -> date:
    """
    Calculate the end date for a session package based on the number of sessions.
    
    Args:
        start_date: The start date of the session package
        total_sessions: Total number of sessions in the package
        exclude_weekends: Whether to exclude weekends (Saturday=5, Sunday=6)
        holidays: List of holiday dates to exclude
    
    Returns:
        The calculated end date
    """
    if holidays is None:
        holidays = []
    
    current_date = start_date
    sessions_counted = 0
    
    # We need to count 'total_sessions' valid days
    while sessions_counted < total_sessions:
        # Check if current date is a valid session day
        is_valid_day = True
        
        # Skip weekends if exclude_weekends is True
        if exclude_weekends and current_date.weekday() >= 5:  # 5=Saturday, 6=Sunday
            is_valid_day = False
        
        # Skip holidays
        if current_date in holidays:
            is_valid_day = False
        
        # If it's a valid day, count it as a session
        if is_valid_day:
            sessions_counted += 1
        
        # If we haven't reached the total sessions yet, move to next day
        if sessions_counted < total_sessions:
            current_date += timedelta(days=1)
    
    return current_date

def get_business_days_between(start_date: date, end_date: date) -> int:
    """
    Calculate the number of business days between two dates (excluding weekends).
    
    Args:
        start_date: Start date
        end_date: End date
    
    Returns:
        Number of business days
    """
    if start_date > end_date:
        return 0
    
    current_date = start_date
    business_days = 0
    
    while current_date <= end_date:
        # Monday = 0, Sunday = 6
        if current_date.weekday() < 5:  # Monday to Friday
            business_days += 1
        current_date += timedelta(days=1)
    
    return business_days

def calculate_days_until_expiry(end_date: date) -> int:
    """
    Calculate days until expiry from today.
    
    Args:
        end_date: The end date to calculate from
    
    Returns:
        Number of days until expiry (negative if expired)
    """
    today = date.today()
    delta = end_date - today
    return delta.days

def calculate_progress_percentage(sessions_completed: int, sessions_total: int) -> float:
    """
    Calculate the progress percentage of completed sessions.
    
    Args:
        sessions_completed: Number of completed sessions
        sessions_total: Total number of sessions
    
    Returns:
        Progress percentage (0.0 to 100.0)
    """
    if sessions_total <= 0:
        return 0.0
    
    percentage = (sessions_completed / sessions_total) * 100
    return round(min(percentage, 100.0), 1)

def get_korean_holidays_2024() -> List[date]:
    """
    Get a list of major Korean holidays for 2024.
    This is a basic implementation - in production, you might want to use a proper holiday library.
    
    Returns:
        List of holiday dates
    """
    holidays = [
        # New Year's Day
        date(2024, 1, 1),
        # Lunar New Year (usually 3 days)
        date(2024, 2, 9),
        date(2024, 2, 10),
        date(2024, 2, 11),
        date(2024, 2, 12),
        # Independence Movement Day
        date(2024, 3, 1),
        # Children's Day
        date(2024, 5, 5),
        # Buddha's Birthday
        date(2024, 5, 15),
        # Memorial Day
        date(2024, 6, 6),
        # Liberation Day
        date(2024, 8, 15),
        # Chuseok (usually 3 days)
        date(2024, 9, 16),
        date(2024, 9, 17),
        date(2024, 9, 18),
        # National Foundation Day
        date(2024, 10, 3),
        # Hangeul Day
        date(2024, 10, 9),
        # Christmas Day
        date(2024, 12, 25),
    ]
    
    return holidays

def get_korean_holidays_2025() -> List[date]:
    """
    Get a list of major Korean holidays for 2025.
    
    Returns:
        List of holiday dates
    """
    holidays = [
        # New Year's Day
        date(2025, 1, 1),
        # Lunar New Year (usually 3 days)
        date(2025, 1, 28),
        date(2025, 1, 29),
        date(2025, 1, 30),
        # Independence Movement Day
        date(2025, 3, 1),
        # Children's Day
        date(2025, 5, 5),
        # Buddha's Birthday
        date(2025, 5, 5),  # Same as Children's Day in 2025
        # Memorial Day
        date(2025, 6, 6),
        # Liberation Day
        date(2025, 8, 15),
        # Chuseok (usually 3 days)
        date(2025, 10, 5),
        date(2025, 10, 6),
        date(2025, 10, 7),
        # National Foundation Day
        date(2025, 10, 3),
        # Hangeul Day
        date(2025, 10, 9),
        # Christmas Day
        date(2025, 12, 25),
    ]
    
    return holidays

def get_current_year_holidays() -> List[date]:
    """
    Get holidays for the current year.
    
    Returns:
        List of holiday dates for current year
    """
    current_year = date.today().year
    
    if current_year == 2024:
        return get_korean_holidays_2024()
    elif current_year == 2025:
        return get_korean_holidays_2025()
    else:
        # For other years, return empty list or implement additional years
        return []