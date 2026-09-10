pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/jakub-chyla/lingo-leap-fe.git'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t lingo-leap-fe:latest .'
            }
        }
    }
}