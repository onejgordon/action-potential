
class EMAILS():

    USER_INVITE = 1

    CONTENT = {
        USER_INVITE: {
            'subject': '%s invited you to %s!',
            'body': '''Your invite code is: %s

To register, go to %s/login and enter your invite code.
'''
        }
    }

class ERROR():
  OK = 0
  UNAUTHORIZED = 1
  BAD_TOKEN = 2
  USER_NOT_FOUND = 3
  MALFORMED = 4
  AUTH_FAILED = 5

  LABELS = {OK: "OK", UNAUTHORIZED: "Unauthorized", BAD_TOKEN: "Bad Token", USER_NOT_FOUND: "User not found", MALFORMED: "Malformed Request!", AUTH_FAILED: "Auth failed"}
