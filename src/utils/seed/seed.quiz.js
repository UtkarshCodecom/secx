import { QuizModule } from '../../models/quiz.model.js';
import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';

export const seedQuizData = asyncHandler(async (req, res) => {
  const quizModules = [
    {
      name: 'Network Security',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1681487746049-c39357159f69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      certificateURL:
        'https://d2vyhi5ouo1we3.cloudfront.net/force_jpg/aHR0cHM6Ly9pbWFnZXMuYmFubmVyYmVhci5jb20vcmVxdWVzdHMvaW1hZ2VzLzAwOC85MjQvNTc5L29yaWdpbmFsL2VhYzQyY2FiZjM5YzIxY2Y4NThlNWY4NDRlZmM0YTA1MjJmOGUxNzkucG5nPzE2MzI4MDgzMDI=/image.jpg',
      isFree: true,
      price: 19.99,
      sections: [
        {
          name: 'Basics of Network Security',
          numberOfQuizzes: 2,
          hugeIconName: 'strokeRoundedSecurityLock',
          quizzes: [
            {
              quizName: 'Introduction to Firewalls',
              duration: '15 minutes',
              certificate: 'Basic Firewall Configuration Certificate',
              questions: [
                {
                  question: 'What is the primary purpose of a firewall?',
                  answerOptions: [
                    'To filter network traffic',
                    'To encrypt data',
                    'To monitor server uptime',
                    'To manage user credentials',
                  ],
                  correctAnswer: 'To filter network traffic',
                },
                {
                  question:
                    'Which type of firewall operates at the application layer?',
                  answerOptions: [
                    'Packet-filtering firewall',
                    'Stateful inspection firewall',
                    'Proxy firewall',
                    'Next-generation firewall',
                  ],
                  correctAnswer: 'Proxy firewall',
                },
              ],
            },
            {
              quizName: 'Network Protocols',
              duration: '20 minutes',
              certificate: 'Network Protocols Certificate',
              questions: [
                {
                  question: 'Which protocol is used for secure web browsing?',
                  answerOptions: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
                  correctAnswer: 'HTTPS',
                },
                {
                  question: 'What does TCP stand for?',
                  answerOptions: [
                    'Transmission Control Protocol',
                    'Transfer Communication Protocol',
                    'Temporary Connection Protocol',
                    'Total Communication Protocol',
                  ],
                  correctAnswer: 'Transmission Control Protocol',
                },
              ],
            },
          ],
        },
        {
          name: 'Advanced Network Security',
          numberOfQuizzes: 2,
          hugeIconName: 'strokeRoundedWebSecurity',
          quizzes: [
            {
              quizName: 'Intrusion Detection Systems',
              duration: '25 minutes',
              certificate: 'IDS Basics Certificate',
              questions: [
                {
                  question:
                    'What is the primary purpose of an Intrusion Detection System (IDS)?',
                  answerOptions: [
                    'To block unauthorized access',
                    'To monitor and analyze network traffic',
                    'To enforce security policies',
                    'To provide data encryption',
                  ],
                  correctAnswer: 'To monitor and analyze network traffic',
                },
                {
                  question: 'Which type of IDS uses pre-defined signatures?',
                  answerOptions: [
                    'Anomaly-based IDS',
                    'Signature-based IDS',
                    'Heuristic-based IDS',
                    'Behavior-based IDS',
                  ],
                  correctAnswer: 'Signature-based IDS',
                },
              ],
            },
            {
              quizName: 'VPN Security',
              duration: '20 minutes',
              certificate: 'VPN Basics Certificate',
              questions: [
                {
                  question:
                    'Which protocol is commonly used in VPNs for secure tunneling?',
                  answerOptions: ['PPTP', 'SMTP', 'HTTP', 'DNS'],
                  correctAnswer: 'PPTP',
                },
                {
                  question: 'What does IPsec stand for?',
                  answerOptions: [
                    'Internet Protocol Security',
                    'Internet Packet Security',
                    'Internet Privacy System',
                    'Inter-Protocol Security',
                  ],
                  correctAnswer: 'Internet Protocol Security',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Web Security',
      imageUrl:
        'https://images.unsplash.com/photo-1691435828932-911a7801adfb?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      certificateURL:
        'https://d2vyhi5ouo1we3.cloudfront.net/force_jpg/aHR0cHM6Ly9pbWFnZXMuYmFubmVyYmVhci5jb20vcmVxdWVzdHMvaW1hZ2VzLzAwOC85MjQvNTc5L29yaWdpbmFsL2VhYzQyY2FiZjM5YzIxY2Y4NThlNWY4NDRlZmM0YTA1MjJmOGUxNzkucG5nPzE2MzI4MDgzMDI=/image.jpg',
      isFree: false,
      price: 29.99,
      sections: [
        {
          name: 'Web Vulnerabilities',
          numberOfQuizzes: 3,
          hugeIconName: 'strokeRoundedBug01',
          quizzes: [
            {
              quizName: 'SQL Injection Basics',
              duration: '20 minutes',
              certificate: 'SQL Injection Prevention Certificate',
              questions: [
                {
                  question: 'What is SQL injection?',
                  answerOptions: [
                    'An attack that injects malicious SQL queries',
                    'A form of network sniffing',
                    'A way to secure web databases',
                    'A tool for encrypting SQL data',
                  ],
                  correctAnswer: 'An attack that injects malicious SQL queries',
                },
                {
                  question:
                    'Which of the following is an example of an SQL injection payload?',
                  answerOptions: [
                    "' OR '1'='1'; --",
                    'DROP TABLE users;',
                    "alert('Hacked!');",
                    "<script>alert('XSS')</script>",
                  ],
                  correctAnswer: "' OR '1'='1'; --",
                },
              ],
            },
            {
              quizName: 'Cross-Site Scripting (XSS)',
              duration: '15 minutes',
              certificate: 'XSS Awareness Certificate',
              questions: [
                {
                  question: 'What does XSS stand for?',
                  answerOptions: [
                    'Cross-Site Scripting',
                    'Cross-System Security',
                    'Cross-Site Security',
                    'Extra-Secure Scripting',
                  ],
                  correctAnswer: 'Cross-Site Scripting',
                },
                {
                  question: 'What is a common way to prevent XSS attacks?',
                  answerOptions: [
                    'Input sanitization',
                    'Disabling SSL',
                    'Using default passwords',
                    'Disabling firewall rules',
                  ],
                  correctAnswer: 'Input sanitization',
                },
              ],
            },
          ],
        },
        {
          name: 'Web Application Security',
          numberOfQuizzes: 2,
          hugeIconName: 'strokeRoundedAiSecurity01',
          quizzes: [
            {
              quizName: 'Authentication Mechanisms',
              duration: '25 minutes',
              certificate: 'Authentication Best Practices Certificate',
              questions: [
                {
                  question:
                    'Which protocol is commonly used for user authentication?',
                  answerOptions: ['OAuth', 'DNS', 'TCP', 'HTTP'],
                  correctAnswer: 'OAuth',
                },
                {
                  question: 'What is a secure way to store user passwords?',
                  answerOptions: [
                    'Plaintext storage',
                    'MD5 hashing',
                    'SHA-256 hashing with salt',
                    'Base64 encoding',
                  ],
                  correctAnswer: 'SHA-256 hashing with salt',
                },
              ],
            },
            {
              quizName: 'Session Management',
              duration: '20 minutes',
              certificate: 'Secure Session Management Certificate',
              questions: [
                {
                  question: 'What is the primary purpose of a session ID?',
                  answerOptions: [
                    'To identify a user session',
                    'To encrypt user data',
                    'To log user activities',
                    'To monitor server performance',
                  ],
                  correctAnswer: 'To identify a user session',
                },
                {
                  question:
                    'Which of the following is a common session fixation vulnerability?',
                  answerOptions: [
                    'Reusing the same session ID',
                    'Using expired session IDs',
                    'Allowing session ID theft',
                    'Resetting session IDs frequently',
                  ],
                  correctAnswer: 'Allowing session ID theft',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Cloud Security',
      imageUrl:
        'https://images.unsplash.com/photo-1614064745729-79e39d1b39b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      certificateURL:
        'https://d2vyhi5ouo1we3.cloudfront.net/force_jpg/aHR0cHM6Ly9pbWFnZXMuYmFubmVyYmVhci5jb20vcmVxdWVzdHMvaW1hZ2VzLzAwOC85MjQvNTc5L29yaWdpbmFsL2VhYzQyY2FiZjM5YzIxY2Y4NThlNWY4NDRlZmM0YTA1MjJmOGUxNzkucG5nPzE2MzI4MDgzMDI=/image.jpg',
      isFree: false,
      price: 24.99,
      sections: [
        {
          name: 'Cloud Security Fundamentals',
          numberOfQuizzes: 2,
          hugeIconName: 'strokeRoundedLaptopCloud',
          quizzes: [
            {
              quizName: 'Cloud Service Models',
              duration: '20 minutes',
              certificate: 'Cloud Models Certificate',
              questions: [
                {
                  question: 'What does IaaS stand for in cloud computing?',
                  answerOptions: [
                    'Infrastructure as a Service',
                    'Internet as a Service',
                    'Integration as a Service',
                    'Information as a Service',
                  ],
                  correctAnswer: 'Infrastructure as a Service',
                },
                {
                  question: 'Which is NOT a common cloud deployment model?',
                  answerOptions: [
                    'Private Cloud',
                    'Public Cloud',
                    'Sequential Cloud',
                    'Hybrid Cloud',
                  ],
                  correctAnswer: 'Sequential Cloud',
                },
              ],
            },
            {
              quizName: 'Cloud Security Risks',
              duration: '25 minutes',
              certificate: 'Cloud Risk Assessment Certificate',
              questions: [
                {
                  question: 'What is data residency in cloud computing?',
                  answerOptions: [
                    'The physical location where data is stored',
                    'The speed of data transfer',
                    'The size of data storage',
                    'The format of stored data',
                  ],
                  correctAnswer: 'The physical location where data is stored',
                },
                {
                  question: 'Which is a common cloud security threat?',
                  answerOptions: [
                    'Data breaches',
                    'Hardware failure',
                    'Network latency',
                    'User interface bugs',
                  ],
                  correctAnswer: 'Data breaches',
                },
              ],
            },
          ],
        },
        {
          name: 'Cloud Security Implementation',
          numberOfQuizzes: 2,
          hugeIconName: 'strokeRoundedLaptopCloud',
          quizzes: [
            {
              quizName: 'Access Management',
              duration: '15 minutes',
              certificate: 'Cloud Access Management Certificate',
              questions: [
                {
                  question: 'What is the principle of least privilege?',
                  answerOptions: [
                    'Giving users minimum necessary access rights',
                    'Providing maximum access to all users',
                    'Restricting all user access',
                    'Rotating access credentials daily',
                  ],
                  correctAnswer: 'Giving users minimum necessary access rights',
                },
                {
                  question:
                    'Which is a best practice for cloud access control?',
                  answerOptions: [
                    'Multi-factor authentication',
                    'Using shared accounts',
                    'Keeping default passwords',
                    'Disabling access logs',
                  ],
                  correctAnswer: 'Multi-factor authentication',
                },
              ],
            },
            {
              quizName: 'Data Encryption',
              duration: '20 minutes',
              certificate: 'Cloud Encryption Certificate',
              questions: [
                {
                  question: 'What is encryption at rest?',
                  answerOptions: [
                    'Encrypting stored data',
                    'Encrypting data in transit',
                    'Encrypting network traffic',
                    'Encrypting user passwords',
                  ],
                  correctAnswer: 'Encrypting stored data',
                },
                {
                  question:
                    'Which encryption key length is considered more secure?',
                  answerOptions: ['256-bit', '64-bit', '32-bit', '128-bit'],
                  correctAnswer: '256-bit',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  await QuizModule.deleteMany(); // Delete existing data

  const CreatedQuizes = await QuizModule.create(quizModules);

  if (!CreatedQuizes) {
    throw new ApiError(500, 'Failed to create quizes');
  }

  const response = new ApiResponse(
    201,
    'Quizes created successfully',
    CreatedQuizes
  );
  return res.status(response.statusCode).json(response);
});
