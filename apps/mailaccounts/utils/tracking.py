import pytracking
from pytracking.html import adapt_html
from lxml import html
import logging
from pytracking.tracking import (
    get_configuration,
    get_open_tracking_url,
    get_click_tracking_url,
)
from mail import settings
import watchtower
logger = logging.getLogger(__name__)

def add_tracking(
    html_message,
    uuid,
    track_opens=False,
    track_linkclick=False,
    tracking_domain=None,
):
    try:
        configuration = pytracking.Configuration(
            base_open_tracking_url=settings.PYTRACKING_CONFIGURATION[
                "base_open_tracking_url"
            ]
            if not tracking_domain
            else tracking_domain + settings.PYTRACKING_CONFIGURATION[
                "custom_domain_open_tracking_path"
            ],
            base_click_tracking_url=settings.PYTRACKING_CONFIGURATION[
                "base_click_tracking_url"
            ]
            if not tracking_domain
            else tracking_domain + settings.PYTRACKING_CONFIGURATION[
                "custom_domain_click_tracking_path"
            ],
        )

        logger.debug(f"Tracking domain: {tracking_domain}")

        return adapt_html(
            html_message,
            extra_metadata={"uuid": uuid},
            click_tracking=track_linkclick,
            open_tracking=track_opens,
            configuration=configuration,
        )
    except Exception as ex:
        print("Exception while adding a tracking info: ", ex)
        return html_message


def adapt_html(
    html_text,
    extra_metadata,
    click_tracking=True,
    open_tracking=True,
    configuration=None,
    **kwargs,
):
    """Changes an HTML string by replacing links (<a href...>) with tracking
    links and by adding a 1x1 transparent pixel just before the closing body
    tag.

    :param html_text: The HTML to change (unicode or bytestring).
    :param extra_metadata: A dict that can be json-encoded and that will
        be encoded in the tracking link.
    :param click_tracking: If links (<a href...>) must be changed.
    :param open_tracking: If a transparent pixel must be added before the
        closing body tag.
    :param configuration: An optional Configuration instance.
    :param kwargs: Optional configuration parameters. If provided with a
        Configuration instance, the kwargs parameters will override the
        Configuration parameters.
    """
    configuration = get_configuration(configuration, kwargs)

    tree = html.fromstring(html_text)

    if click_tracking:
        _replace_links(tree, extra_metadata, configuration)

    if open_tracking:
        _add_tracking_pixel(tree, extra_metadata, configuration)

    new_html_text = html.tostring(tree)

    return new_html_text.decode("utf-8")


def _replace_links(tree, extra_metadata, configuration):
    for (element, attribute, link, pos) in tree.iterlinks():
        if element.tag == "a" and attribute == "href" and _valid_link(link):
            new_link = get_click_tracking_url(
                link, extra_metadata, configuration
            )
            element.attrib["href"] = new_link


def _add_tracking_pixel(tree, extra_metadata, configuration):
    url = get_open_tracking_url(extra_metadata, configuration)
    pixel = html.Element(
        "img",
        {
            "src": url,
            "alt": "",
            "width": "1",
            "height": "1",
            "style": "float:left;marg=in-left:-1px;position:absolute;",
        },
    )
    tree.body.append(pixel)


def _valid_link(link):
    return (
        link.startswith("http://")
        or link.startswith("https://")
        or link.startswith("//")
    )
