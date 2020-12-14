from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="my_applications")
location = geolocator.reverse("38.638191, -28.016938")
print(location.address.split(',')[-1].strip())