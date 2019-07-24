# Pomocnik trenera
To repozytorium zawiera kod początkowy i gotowe rozwiązanie dla aplikacji
"pomocnik trenera", której napisaniem zajmujemy się w ramach 34. warsztatów
WarsawJS, używając WebSocketów.

Aplikacja ma docelowo służyć uczestnikom do wzywania trenerów wspomagających,
co pozwoli w łatwy sposób zwrócić się z prośbą o wsparcie bez konieczności
szukania konkretnych osób w sali, a także ułatwi to zadanie nieśmiałym osobom.

Pożądane funkcjonalności:
* Rejestrowanie swojej obecności jako trener lub uczestnik
* Wysyłanie prósb o pomoc wraz z podglądem ich statusu
* Przyjmowanie próśb o pomoc z informacją zwrotną dla uczestnika
* Obsługa różnych sytuacji sieciowych, w tym ponownego łączenia

## Pierwsze uruchomienie
Aby uruchomić startową wersję projektu, należy:
* Mieć Node.js w wersji 10.x lub późniejszej i `npm` w wersji co najmniej 6.x
* Sklonować to repozytorium:
```
git clone https://github.com/rkaw92/warsawjs-workshop-34-trainer-needed.git
```
* Zainstalować zależności:
```
npm install
```
* Zbudować plik JS dla przeglądarki:
```
npm run dev
```
* Uruchomić serwer:
```
npm start
```

Następnie, przy każdej zmianie po stronie klienta trzeba ponownie zbudować JS
i zrestartować serwer.

Wstępna wersja aplikacji zawiera tylko powłokę graficzną, ale nie realizuje
faktycznie żadnych funkcji - dodanie obsługi komunikacji sieciowej i napisanie
serwera dla protokołu WebSocket, a także implementacja logiki po stronie klienta
i serwera, to zadania dla uczestników.

## Plan pracy
W ramach szkolenia chcemy wykonać następujące zadania:
1. Zapoznać się z zasadą działania protokołu WebSocket
2. Zaimplementować prosty serwer za pomocą biblioteki `ws` dla Node.js
3. Wypróbować łączenie się z serwerem z poziomu przeglądarki
4. Dodać łączenie z serwerem do aplikacji klienckiej
5. Zaimplementować reagowanie na zmianę stanu połączenia i wyświetlanie
informacji dla użytkownika
6. Zaprojektować protokół komunikacyjny do obsługi wszystkich funkcjonalności,
uwzględniający zawodność sieci i małą entropię w przeglądarce
7. Zaimplementować rejestrowanie obecności, wzywanie pomocy i odpowiadanie
na wezwania po stronie serwera i klienta
8. Dodać przywracanie stanu z serwera przy ładowaniu widoków
9. Przetestować zachowanie aplikacji w obliczu problemów sieciowych

## Licencja
Kod źródłowy i dokumentacja są dostępne na otwartej licencji MIT.
