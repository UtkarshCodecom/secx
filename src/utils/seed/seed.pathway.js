import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { Pathway } from '../../models/pathway.model.js';


export const seedPathwayData = asyncHandler(async (req, res) => {
  const pathways = [
    {
      title: 'Ethical Hacker Certification',
      imageUrl:
        'https://images.unsplash.com/photo-1666875758412-5957b60d7969?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      isFree: false,
      price: 29.99,
      sections: [
        {
          title: 'Introduction to Ethical Hacking',
          lessons: [
            {
              title: 'Understanding Ethical Hacking',
              htmlContent:
                '<h2>Understanding Ethical Hacking</h2><p>Learn the fundamentals of ethical hacking and its importance in cybersecurity.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
            },
            {
              title: 'Basic Networking Concepts',
              htmlContent:
                '<h2>Basic Networking Concepts</h2><p>Explore the essentials of computer networks and how they relate to hacking.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
            },
          ],
        },
        {
          title: 'Reconnaissance and Information Gathering',
          lessons: [
            {
              title: 'Footprinting Techniques',
              htmlContent:
                '<h2>Footprinting Techniques</h2><p>Learn how to gather information about a target system.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
            },
            {
              title: 'OSINT Tools',
              htmlContent:
                '<h2>OSINT Tools</h2><p>Explore tools and techniques for Open Source Intelligence gathering.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
            },
          ],
        },
      ],
    },
    {
      title: 'SOC Analyst',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1705267936187-aceda1a6c1a6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      isFree: false,
      price: 39.99,
      sections: [
        {
          title: 'Introduction to SOC',
          lessons: [
            {
              title: 'Understanding SOC',
              htmlContent:
                '<h2>Understanding SOC</h2><p>An overview of the Security Operations Center and its functions.</p>',
              videoUrl: 'https://youtu.be/OHkWXFheSKM?si=OuxcXq1PU7MCwzGh',
            },
            {
              title: 'Incident Monitoring Basics',
              htmlContent:
                '<h2>Incident Monitoring Basics</h2><p>Learn how to monitor and respond to security incidents.</p>',
              videoUrl: 'https://youtu.be/OHkWXFheSKM?si=OuxcXq1PU7MCwzGh',
            },
          ],
        },
        {
          title: 'Advanced SOC Tools',
          lessons: [
            {
              title: 'Using SIEM Systems',
              htmlContent:
                '<h2>Using SIEM Systems</h2><p>Understand how to use Security Information and Event Management tools.</p>',
              videoUrl: 'https://youtu.be/OHkWXFheSKM?si=OuxcXq1PU7MCwzGh',
            },
            {
              title: 'Log Analysis Techniques',
              htmlContent:
                '<h2>Log Analysis Techniques</h2><p>Dive into analyzing logs to identify potential threats.</p>',
              videoUrl: 'https://youtu.be/OHkWXFheSKM?si=OuxcXq1PU7MCwzGh',
            },
          ],
        },
      ],
    },
    {
      title: 'Incident Response Expert',
      imageUrl:
        'https://images.unsplash.com/photo-1580795479172-6c29db0fd7c4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      isFree: true,
      price: 49.99,
      sections: [
        {
          title: 'Introduction to Incident Response',
          lessons: [
            {
              title: 'Incident Response Basics',
              htmlContent:
                '<h2>Incident Response Basics</h2><p>Learn the basic principles of responding to security incidents.</p>',
              videoUrl: 'https://youtu.be/YZSM3YPn998?si=p5cH_g0Jai_Bafqz',
            },
            {
              title: 'Types of Incidents',
              htmlContent:
                '<h2>Types of Incidents</h2><p>Explore various types of incidents that a security team may face.</p>',
              videoUrl: 'https://youtu.be/YZSM3YPn998?si=p5cH_g0Jai_Bafqz',
            },
          ],
        },
        {
          title: 'Forensics and Root Cause Analysis',
          lessons: [
            {
              title: 'Digital Forensics',
              htmlContent:
                '<h2>Digital Forensics</h2><p>Understand the role of forensics in incident response.</p>',
              videoUrl: 'https://youtu.be/YZSM3YPn998?si=p5cH_g0Jai_Bafqz',
            },
            {
              title: 'Performing RCA',
              htmlContent:
                '<h2>Performing RCA</h2><p>Learn how to identify the root cause of an incident effectively.</p>',
              videoUrl: 'https://youtu.be/YZSM3YPn998?si=p5cH_g0Jai_Bafqz',
            },
          ],
        },
      ],
    },
    {
      title: 'Blockchain Security Specialist',
      imageUrl:
        'https://images.unsplash.com/photo-1642364706728-14a86b585bb1?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      isFree: false,
      price: 10.99,
      sections: [
        {
          title: 'Introduction to Blockchain',
          lessons: [
            {
              title: 'Blockchain Basics',
              htmlContent:
                '<h2>Blockchain Basics</h2><p>Discover the principles of blockchain technology.</p>',
              videoUrl: 'https://youtu.be/Eh5o3PaHCJU?si=VotPpqpTA8OmgWtW',
            },
            {
              title: 'Cryptographic Fundamentals',
              htmlContent:
                '<h2>Cryptographic Fundamentals</h2><p>Learn about cryptography and its importance in blockchain.</p>',
              videoUrl: 'https://youtu.be/Eh5o3PaHCJU?si=VotPpqpTA8OmgWtW',
            },
          ],
        },
        {
          title: 'Securing Blockchain Applications',
          lessons: [
            {
              title: 'Smart Contract Security',
              htmlContent:
                '<h2>Smart Contract Security</h2><p>Understand how to secure smart contracts from vulnerabilities.</p>',
              videoUrl: 'https://youtu.be/Eh5o3PaHCJU?si=VotPpqpTA8OmgWtW',
            },
            {
              title: 'Blockchain Attack Vectors',
              htmlContent:
                '<h2>Blockchain Attack Vectors</h2><p>Explore common attack vectors targeting blockchain systems.</p>',
              videoUrl: 'https://youtu.be/Eh5o3PaHCJU?si=VotPpqpTA8OmgWtW',
            },
          ],
        },
      ],
    },
  ];

  await Pathway.deleteMany(); // Delete existing data

  const CreatedPathways = await Pathway.create(pathways);

  if (!CreatedPathways) {
    throw new ApiError(500, 'Failed to create Pathways');
  }

  const response = new ApiResponse(
    201,
    'Pathways created successfully',
    CreatedPathways
  );
  return res.status(response.statusCode).json(response);
});
