import csv



csv_reader = csv.reader(open('complete.csv'), delimiter=',')
writer = csv.writer(open('data.csv', "w"), delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

line_count = 0
reports = 0
for row in csv_reader:
    #print(row)
    if line_count == 0 :
        #print(row)
        writer.writerow(row)
        line_count += 1
        #break
    elif row[3] != '' and row[9] != '0':
        #print(row[3])
        writer.writerow(row)
        line_count += 1
        reports += 1


print(line_count)
print(reports)
print("Done!")