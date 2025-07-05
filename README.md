The Motorsports Platform is a full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It is designed to manage motorsports events, vehicles, and user interactions in a secure and efficient environment.
The platform supports three main user roles:
Admin – Manages users, events, and the overall system.

Car Owner – Registers vehicles and signs up for events.

Spectator – Views events and purchases tickets.

Each role has a dedicated dashboard with specific features, ensuring a tailored user experience. The system uses JWT-based authentication with role-based access control and stores tokens in HTTP-only cookies to enhance security.

The backend, developed with Node.js and Express.js, exposes RESTful APIs to handle user registration, login, car and event management, and ticket transactions. MongoDB is used for data storage, enabling flexible and scalable data handling.

The frontend is built with React.js and provides a responsive, user-friendly interface. It includes dynamic routing, protected pages based on user roles, and modern React practices such as Hooks and component reusability.

This project demonstrates essential full-stack development practices, including secure authentication, modular architecture, API integration, and responsive UI design. It is ideal for developers looking to explore role-based systems and event management platforms.
