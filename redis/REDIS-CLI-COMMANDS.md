
- connecting with redis cli

```sh
docker exec -it <container-name/id> redis-cli
```

- ping the redis server

```sh
PING
```

- set a key value pair

```sh
SET foo bar
```

- get the latest value by key

```sh
GET foo
```

- quit 

```sh
QUIT
```

- information

```sh
INFO
INFO server
INFO memory
INFO clients

```

- echo printing the redis

```sh
ECHO "hello redis"

```

- seting with : seperating as key

```sh
SET user:1:name "Harshith Kurapati"
```
- get with exact key

```sh
GET user:1:name
```

- to check if a key is present

```sh
EXISTS user:1:name
```

- delete a value by using key

```sh
DEL user:1:name
```

- to find out ttl -> time to live 

```sh
TTL user:1:name
```
- -1 no expirty

- set with expiry

```sh
SET user:1:name "Name"
EXPIRE user:1:name 30
```

- -1 → key exists, no TTL
- -2 → key doesn’t exist

```sh
TTL user:1:name
```

- to remove the ttl we have to use persist keyword with key
```sh
PERSIST temp:key
```

- setting ttl with set

```sh
SET user:1:name "Harshith Kurapati" EX 100
```

- with milli seconds below will expire in 10 sec or 10000 milli seconds

```sh
SET user:1:name "Harshith Kurapati" PX 10000
```

EX <sec> → TTL in seconds

PX <ms> → TTL in ms

NX → only set if key does NOT exist

XX → only set if key DOES exist

Example: only create OTP if not already set:

```sh
SET login:otp:1234 "9999" EX 60 NX
```

- to list the existing keys

```sh
KEY *
KEY user:*
KEY session:*
```

- It’s blocking and O(N) over all keys. On big instances it can pause the world briefly.

- SCAN (iterative, non-blocking)

- SCAN <cursor> [MATCH pattern] [COUNT n]

```sh
SCAN 0 MATCH user:* COUNT 2

```


2️⃣ Append: APPEND

```sh
SET name "Harshith"
APPEND name " Kurapati"
```

- Now test size:

```sh
STRLEN name
```

3️⃣ Numeric Strings: INCR, INCRBY

```sh
SET counter 0
INCR counter
```

- INCRBY counter <value>

```sh
INCRBY counter 10
```

- increment by negative

```sh
INCRBY counter -4
```

4️⃣ Multi-set / Multi-get: MSET, MGET

Batch operations cut round-trip time.

```sh
MSET user:1:name "Bruce" user:1:city "Gotham" user:1:power "Money"
MGET user:1:name user:1:city user:1:power
```


```sh
SET otp:1234 "9999" EX 30
TTL otp:1234
GET otp:1234
```

6️⃣ String Gotchas (worth feeling, not memorizing)

```sh
SET name "apple"
INCR name
```
<!-- 127.0.0.1:6379> INCR name
(error) ERR value is not an integer or out of range -->

Hashes let Redis pretend it’s storing tiny objects, except it does so with the ruthless efficiency of a memory-obsessed librarian. You get a single top-level key that contains a bunch of fields, so instead of having user:1:name, user:1:age, etc. as separate keys, you stuff them inside a single "objectish" container.

```sh
HSET user:1 name "Harshith" age "26" experience "4.5 Years"
```

- getting single field

```sh
HGET user:1 name 
```

- check existance of a field

```sh
HEXISTS user:1 name
```

2️⃣ Fetch entire object: HGETALL

```sh
HGETALL user:1
```

3️⃣ Fetch specific fields: HMGET

```sh
HMGET user:1 name age
```

4️⃣ Increment numeric fields: HINCRBY

```sh
HINCRBY user:1 age -1
```

- delete a field

```sh
HDEL user:1 age
```

8️⃣ Gotchas worth knowing
Hashes are optimized for small objects

Think dozens of fields, not millions.
Redis uses a special encoding for small hashes that is memory efficient and fast.

Everything is a string

Even numbers.
You are the semantic enforcer.

No nested structures

There are no hash-inside-hash unless you encode/namespace manually.