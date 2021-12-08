from datetime import datetime
from dateutil import parser


def accept_email_datetime_format(date_str: str, dt_format: [str] = None) -> datetime:
    """
    Function convert the date_str to datetime object by using provided
     datetime format and return datetime object.
    """
    if not dt_format:
        dt_format = ["%a, %d %b %Y %H:%M:%S %Z",
                     "%a, %d %b %Y %H:%M:%S %z",
                     "%d %b %Y %H:%M:%S %Z",
                     "%d %b %Y %H:%M:%S %z",
                     '%a, %d %b %Y %X %z (%Z)'
                    ]
    try:
        return parser.parse(date_str)
    except (parser.ParserError, parser.UnknownTimezoneWarning, ValueError) as e:
        for fmt in dt_format:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError as e:
                pass
    raise ValueError(f"time data '{date_str}' does not match format `{dt_format}`")
