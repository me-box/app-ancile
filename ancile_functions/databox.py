from ancile.core.decorators import *
from ancile.lib.general import get_token
from ancile.utils.errors import AncileException

name="databox"


@ExternalDecorator()
def get_latest(data_source_id):
    import requests

    url = "https://127.0.0.1/app-ancile/ui/latest"
    payload = { "data_source_id": data_source_id }
    res = requests.get(url, params=payload)
    if res.status_code == 200:
        data = res.json()
    else:
        raise AncileException("Couldn't fetch data from databox.")

    return data