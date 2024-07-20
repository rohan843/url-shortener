# The Database

The schema of the DB can be seen in the [./init.sql](./init.sql) file.

The [Dockerfile](./Dockerfile) creates a postgres image with the `init.sql` commands as the initializer code.

To run this, we first build an image that will actually run in a container using `docker build`:

```bash
docker build -t url_db_image .
```

Next, we will require to run a container using this image (tagged `url_db_image` via the above command). For this, execute the following:

```bash
docker run --name url_db_container -e POSTGRES_USER=webserver -e POSTGRES_PASSWORD=highlysecurepassword -p 5432:5432 -d url_db_image
```

This command will:

1. Start a container called `url_db_container` with the image we created.
2. Set the environment variables as above (username and password) that postgres internally uses.
3. Forward the port `5432` from the docker to the port `5432` of our `localhost`, allowing us to access the DB.

Now, the DB should be up and running for usage.
