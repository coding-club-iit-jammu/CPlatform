import csv, json, sys

rows = [["Entry No", "Marks"]]
if sys.argv[1] is not None and sys.argv[2] is not None:
    fileInput = sys.argv[1]
    fileOutput = sys.argv[2]
    inputFile = open(fileInput) 
    data = eval(inputFile.read()) 
    # print(data)
    for key in data.keys():
        rows.append([key, 1])
    with open(fileOutput, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(rows)