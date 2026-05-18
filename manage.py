import project

def main():
    try: 
        project.project.run(debug=True, port= 8000)
    except Exception as error:
        print(error)

if __name__ == "__main__":
    main()