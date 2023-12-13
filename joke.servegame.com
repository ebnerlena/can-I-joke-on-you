server {

	server_name joke.servegame.com www.joke.servegame.com;
	listen 193.170.119.173:443 ssl; # managed by Certbot

	location / {
		# Reverse proxy for Next server
        	proxy_pass http://localhost:3000;
        	proxy_http_version 1.1;
        	proxy_set_header Upgrade $http_upgrade;
        	proxy_set_header Connection "upgrade";
        	proxy_set_header Host $host;
        	proxy_set_header X-Real-IP $remote_addr;
        	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        	proxy_set_header X-Forwarded-Proto $scheme;
        	proxy_set_header X-Forwarded-Host $host;
        	proxy_set_header X-Forwarded-Port $server_port;		
	}

	# Needed so that downloads are working
	location /logs {
		alias /var/www/joke/public/logs;
	   	expires 30d;
		add_header Cache-Control "public, max-age=2592000";
		
		types {
			application/json json;
		}

		# Reverse proxy for Next server
		proxy_pass http://localhost:3000;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Port $server_port;
	}


   # listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/joke.servegame.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/joke.servegame.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}


server {
    if ($host = joke.servegame.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot



	server_name joke.servegame.com www.joke.servegame.com;
    listen 80;
    return 404; # managed by Certbot
}