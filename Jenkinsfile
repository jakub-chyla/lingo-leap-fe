pipeline {
    agent any

    stages {
        stage('Docker Build') {
            steps {
                sh 'docker build -t lingo-leap-fe:latest .'
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