import { asyncHandler } from '../asyncHandler.js';
import { ApiResponse } from '../ApiResponse.js';
import { Course } from '../../models/course.model.js';

export const seedCourseData = asyncHandler(async (req, res) => {
  const courses = [
    {
      title: 'Master Ethical Hacking',
      subtitle: 'Learn to think like a hacker to protect your systems',
      duration: '30 hours',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1666875758412-5957b60d7969?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cybersecurity',
      description:
        'This course provides comprehensive training in ethical hacking, including reconnaissance, system hacking, and penetration testing techniques.',
      certificateURL: 'Certified Ethical Hacker',
      isFree: false,
      price: 29.99,
      sections: [
        {
          title: 'Introduction to Ethical Hacking',
          lessons: [
            {
              title: 'What is Ethical Hacking?',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
              duration: '15 minutes',
            },
            {
              title: 'Types of Hackers',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
              duration: '12 minutes',
            },
            {
              title: 'Legal Aspects of Hacking',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
              duration: '10 minutes',
            },
          ],
        },
        {
          title: 'Penetration Testing Basics',
          lessons: [
            {
              title: 'What is Penetration Testing?',
              videoUrl: 'https://youtu.be/B7tTQ272OHE?si=lvFNVRltE-6kuWms',
              duration: '20 minutes',
            },
            {
              title: 'Tools for Penetration Testing',
              videoUrl: 'https://youtu.be/B7tTQ272OHE?si=lvFNVRltE-6kuWms',
              duration: '25 minutes',
            },
          ],
        },
        {
          title: 'Advanced Hacking Techniques',
          lessons: [
            {
              title: 'Exploitation Techniques',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
              duration: '30 minutes',
            },
            {
              title: 'Post Exploitation',
              videoUrl: 'https://www.youtube.com/watch?v=fNzpcB7ODxQ',
              duration: '22 minutes',
            },
          ],
        },
      ],
    },
    {
      title: 'Network Security Fundamentals',
      subtitle: 'Protecting networks from breaches and cyberattacks',
      duration: '25 hours',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1691435828932-911a7801adfb?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cybersecurity',
      description:
        'This course teaches the core principles of network security, including firewalls, intrusion detection, and secure configurations.',
      certificateURL: 'Network Security Specialist',
      isFree: true,
      price: 19.99,
      sections: [
        {
          title: 'Understanding Network Security',
          lessons: [
            {
              title: 'Introduction to Networking',
              videoUrl: 'https://youtu.be/BdDd_Ez4iZs?si=yPDWwnEwjQtFnATK',
              duration: '18 minutes',
            },
            {
              title: 'Types of Network Attacks',
              videoUrl: 'https://youtu.be/BdDd_Ez4iZs?si=yPDWwnEwjQtFnATK',
              duration: '22 minutes',
            },
          ],
        },
        {
          title: 'Firewall and IDS Basics',
          lessons: [
            {
              title: 'What is a Firewall?',
              videoUrl: 'https://youtu.be/kDEX1HXybrU?si=Ce-lvS_xalDb24FU',
              duration: '14 minutes',
            },
            {
              title: 'Intrusion Detection Systems',
              videoUrl: 'https://youtu.be/kDEX1HXybrU?si=Ce-lvS_xalDb24FU',
              duration: '20 minutes',
            },
          ],
        },
        {
          title: 'Network Hardening',
          lessons: [
            {
              title: 'Securing Network Configurations',
              videoUrl: 'https://youtu.be/SbG3z1Pl8YY?si=TrbvDa2S8Z0B7cxH',
              duration: '25 minutes',
            },
            {
              title: 'Best Practices for Network Security',
              videoUrl: 'https://youtu.be/SbG3z1Pl8YY?si=TrbvDa2S8Z0B7cxH',
              duration: '18 minutes',
            },
          ],
        },
      ],
    },
    {
      title: 'Digital Forensics Essentials',
      subtitle: 'Learn to investigate and analyze cyber incidents',
      duration: '20 hours',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cybersecurity',
      description:
        'This course covers the fundamentals of digital forensics, including evidence collection, analysis, and reporting.',
      certificateURL: 'Certified Forensic Analyst',
      isFree: false,
      price: 45.99,
      sections: [
        {
          title: 'Basics of Digital Forensics',
          lessons: [
            {
              title: 'What is Digital Forensics?',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '15 minutes',
            },
            {
              title: 'Forensic Tools Overview',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '12 minutes',
            },
          ],
        },
        {
          title: 'Collecting Evidence',
          lessons: [
            {
              title: 'Types of Digital Evidence',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '20 minutes',
            },
            {
              title: 'Best Practices in Evidence Collection',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '18 minutes',
            },
          ],
        },
        {
          title: 'Forensic Analysis',
          lessons: [
            {
              title: 'Analyzing Hard Drives',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '25 minutes',
            },
            {
              title: 'Report Writing in Forensics',
              videoUrl: 'https://youtu.be/8zxrd6O9QC0?si=tmqEZzrx15fs0y9s',
              duration: '20 minutes',
            },
          ],
        },
      ],
    },
    {
      title: 'Cloud Security Basics',
      subtitle: 'Securing your cloud infrastructure and data',
      duration: '15 hours',
      thumbnailUrl:
        'https://plus.unsplash.com/premium_photo-1700830452509-6e206a0d44d6?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cybersecurity',
      description:
        'This course introduces you to cloud security principles, including secure configurations, data protection, and access management.',
      certificateURL: 'Cloud Security Specialist',
      isFree: true,
      price: 24.99,
      sections: [
        {
          title: 'Introduction to Cloud Security',
          lessons: [
            {
              title: 'What is Cloud Security?',
              videoUrl: 'https://youtu.be/jI8IKpjiCSM?si=KccgPcnqHtXeesC-',
              duration: '12 minutes',
            },
            {
              title: 'Common Cloud Security Risks',
              videoUrl: 'https://youtu.be/jI8IKpjiCSM?si=KccgPcnqHtXeesC-',
              duration: '18 minutes',
            },
          ],
        },
        {
          title: 'Data Protection in the Cloud',
          lessons: [
            {
              title: 'Encrypting Cloud Data',
              videoUrl: 'https://youtu.be/jI8IKpjiCSM?si=KccgPcnqHtXeesC-',
              duration: '15 minutes',
            },
            {
              title: 'Access Control Strategies',
              videoUrl: 'https://youtu.be/jI8IKpjiCSM?si=KccgPcnqHtXeesC-',
              duration: '20 minutes',
            },
          ],
        },
      ],
    },
    {
      title: 'Introduction to Cryptography',
      subtitle: 'Master the basics of encryption and secure communication',
      duration: '20 hours',
      thumbnailUrl:
        'https://plus.unsplash.com/premium_photo-1685086785131-e65690faa5bb?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      category: 'Cybersecurity',
      description:
        'This course covers the fundamentals of cryptography, including symmetric and asymmetric encryption, hashing, and digital signatures.',
      certificateURL: 'Certified Cryptography Specialist',
      isFree: false,
      price: 34.99,
      sections: [
        {
          title: 'Cryptography Fundamentals',
          lessons: [
            {
              title: 'What is Cryptography?',
              videoUrl: 'https://youtu.be/trHox1bN5es?si=GO8omWsFWFtbchdw',
              duration: '15 minutes',
            },
            {
              title: 'Symmetric vs Asymmetric Encryption',
              videoUrl: 'https://youtu.be/trHox1bN5es?si=GO8omWsFWFtbchdw',
              duration: '20 minutes',
            },
          ],
        },
        {
          title: 'Applications of Cryptography',
          lessons: [
            {
              title: 'Digital Signatures',
              videoUrl: 'https://youtu.be/trHox1bN5es?si=GO8omWsFWFtbchdw',
              duration: '18 minutes',
            },
            {
              title: 'Blockchain and Cryptography',
              videoUrl: 'https://youtu.be/trHox1bN5es?si=GO8omWsFWFtbchdw',
              duration: '22 minutes',
            },
          ],
        },
      ],
    },
  ];

  await Course.deleteMany(); // Delete existing data

  const CreatedCourses = await Course.create(courses);

  if (!CreatedCourses) {
    throw new ApiError(500, 'Failed to create Courses');
  }

  const response = new ApiResponse(
    201,
    'Courses created successfully',
    CreatedCourses
  );
  return res.status(response.statusCode).json(response);
});
