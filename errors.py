
class APIError(Exception):
    def __init__(self, message, errors=None):
        super(APIError, self).__init__(message)
