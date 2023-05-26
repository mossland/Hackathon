plugins {
    kotlin("jvm") version "1.8.21"
    application
}

group = "land.moss"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}


dependencies {
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.15.1")
    implementation("org.apache.httpcomponents.client5:httpclient5:5.2.1")
    implementation("org.apache.httpcomponents.core5:httpcore5:5.2.1")
}

kotlin {
    jvmToolchain(17)
}

application {
    mainClass.set("MainKt")
}