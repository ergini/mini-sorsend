# Mini Sorsend - Task Management System
Sask management app with Next.js, Socket.IO, Prisma, and PostgreSQL.

## Teknologjite
- Next.js with Ant Design
- Prisma with Postgre
- Zustand for state management - Used this for keeping the role persistent
- Tanstack React Query - I'm doing data fetching on client side, the best one out there with built-in caching
- SocketIO for realtime updates - I've used this on every possible change

## Setup

### DB Setup
1. Go to pgAdmin
2. Create a new database named <code>mini-sorsend-db</code>
3. Open code and edit `.env` file, add your database url in this format: `DATABASE_URL=postgresql://username:password@host:port/mini-sorsend-db`

### Dependecies installation
1. Run this script:
```bash
npm install
```

### App Start
1. Run this script:
```bash
npm run dev
```
1. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Questions

### 1. Nëse ky modul do të përdorej nga 10,000+ përdorues, çfarë do ndryshoje?

- **Backups**: Ne kete rast kemi te dhena te shumta dhe sa me shume te dhena aq me shume pergjegjesi. Per te mos shkaktuar konfuzim ne rast se databaza jone per qfaredo arsye mund te mos jete funksionale ne nje interval te caktuar kohore, na duhet te kemi backups te asaj databaze. Sugjerimi im do te ishte i thjeshte, te jete nje `replica` i databazes kryesore, e cila nuk behet fetch perveq ne raste te veqanta apo per shkaqe testimi
- **Dizajni**: Edhe pse me rendesi eshte qe aplikacioni te funksionoj ne rregull, ne nje volum prej 10k perdorues gjasat qe te kemi kerkesa per ndryshime ne UI jane te medha. Andaj do te shqyrtoja kerkesat dhe do te shikoja nese ajo qe po kerkohet eshte me te vertete e nevojshme, nje UI/UX i mire i mbane perdoruesit te angazhuar sa me shume me app-in tone.

### 2. Çfarë rreziqesh ose edge-case mund të ndodhin?

- Ne rast se nuk kemi autentikim te menyrave te ndryshme ne te dyja ambientet Client Side dhe Server Side, atehere me kerkesa nga jashte ne API-t tona mund te krijohen, perditesohen apo edhe fshihen projekte.

### 3. Si do e parandalosh dublimin e task-eve në një sistem webhook?

- Ne momentin qe pranojme nje webhook atehere do te kontrolloja per nje field e cila e ben te dalluar nje task i cili eshte krijuar nga webhook, nese ekziston nje e tille atehere webhook vazhdon tutje dhe nuk krijon taske te re.