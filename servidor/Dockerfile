# 1) Compilar con Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
COPY preguntas.ejemplo.json .
RUN mvn -q -B -DskipTests package

# 2) Ejecutar solo con Java (imagen pequeña)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/pixpro-vivo.jar .
COPY --from=build /app/preguntas.ejemplo.json .
# Render indica el puerto en la variable PORT (10000 por defecto)
ENV PORT=10000
EXPOSE 10000
CMD ["java", "-jar", "pixpro-vivo.jar"]
