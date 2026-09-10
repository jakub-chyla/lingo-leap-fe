pipeline {
    agent any

    stages {
        stage('Docker Build') {
            steps {
                sh 'docker build -t lingo-leap-fe:latest .'
            }
        }
    }
}