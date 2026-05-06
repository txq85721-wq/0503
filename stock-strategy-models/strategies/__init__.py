"""A-share systematic trading strategy toolkit."""

from .ema_trend import generate_ema_trend_signal
from .market_timing import get_market_regime
from .risk import calculate_position_size

__all__ = [
    "generate_ema_trend_signal",
    "get_market_regime",
    "calculate_position_size",
]
