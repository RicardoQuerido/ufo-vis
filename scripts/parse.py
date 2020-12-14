import csv
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="my_applications")
c = {}
countries = csv.reader(open('countries.csv'), delimiter=',')
for row in countries:
    c[row[0]] = row[1].lower()
try:
    print(c['ss'])
except:
    print('error')

csv_reader = csv.reader(open('complete.csv'), delimiter=',')
writer = csv.writer(open('data_with_countries.csv', "w"), delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

line_count = 0
reports = 0
for row in csv_reader:
    if line_count == 0 :
        writer.writerow(row)
        line_count += 1
    elif row[3] != '' and row[9] != '0':
        writer.writerow(row)
        line_count += 1
        reports += 1
    elif row[9] != '0':
        line_count += 1
        try:
            location = geolocator.reverse(row[9]+ ", " + row[10], language='en')
            line = (row[0]+','+row[1]+','+row[2]+','+c[location.address.split(',')[-1].strip()]+','+row[4]+','+row[5]+','+row[6]+','+row[7]+','+row[8]+','+row[9]+','+row[10]).split(',')
            writer.writerow(line)
            reports+=1
        except:
            print("error")


print(line_count)
print(reports)
print("Done!")