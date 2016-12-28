from google.appengine.ext import vendor
import os

# Add any libraries installed in the "lib" folder.
ABS = True
if ABS:
	vendor.add(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'lib'))
else:
	vendor.add('lib')