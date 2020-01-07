## Disclaimer
Ta lista nie jest zrobiona dobrze i nie jest przykładem poprawnego tworzenia serwisów w PHP.

## Uruchamianie
Uruchomienie listy piątej: `php -S localhost:<port>` w katalogu nadrzędnym.

## Tabele
Schema tabeli w SQLite:
```sqlite
CREATE TABLE users(username text PRIMARY KEY, password text);
```

```sqlite
CREATE TABLE comments(article int, author text REFERENCES users(username), content text);
```

```sqlite
CREATE TABLE visits(ip text, timestamp number);
```