build: 
	docker build -t nasabot .

run: 
	docker run -d -p 3000:3000 --name nasabot nasabot