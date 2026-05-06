from __future__ import annotations

import pandas as pd


def ema(series: pd.Series, span: int) -> pd.Series:
    """Calculate exponential moving average."""
    if span <= 0:
        raise ValueError("span must be positive")
    return series.ewm(span=span, adjust=False).mean()


def simple_moving_average(series: pd.Series, window: int) -> pd.Series:
    """Calculate simple moving average."""
    if window <= 0:
        raise ValueError("window must be positive")
    return series.rolling(window=window).mean()


def relative_strength(stock_close: pd.Series, benchmark_close: pd.Series, window: int = 20) -> pd.Series:
    """Calculate simple relative strength versus a benchmark.

    Positive value means the stock outperformed the benchmark over the given window.
    """
    stock_return = stock_close.pct_change(window)
    benchmark_return = benchmark_close.pct_change(window)
    return stock_return - benchmark_return
