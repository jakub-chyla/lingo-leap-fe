pipeline {
    agent any

    stages {

        stage('Docker Build') {
            steps {
                sh 'docker build -t ghcr.io/jakub-chyla/lingo-leap-fe:latest .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    cd /opt/docker/application
                    docker compose up -d --force-recreate frontend
                '''
            }
        }
    }

    post {
        always {
            sh '''
                echo "Cleaning Docker build cache..."
                docker builder prune -f

                echo "Cleaning dangling images..."
                docker image prune -f

                echo "Cleanup finished."
            '''
        }
    }
}