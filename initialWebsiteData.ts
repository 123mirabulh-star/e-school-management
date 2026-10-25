import { WebsiteData, WebsiteNavigationItem } from '../types/website';

export const INITIAL_WEBSITE_NAVIGATION: WebsiteNavigationItem[] = [
  {
    id: 'nav-home',
    labelEn: 'Home',
    labelBn: 'মূলপাতা',
    destination: 'home',
    isActive: true,
    order: 1
  },
  {
    id: 'nav-about',
    labelEn: 'About Us',
    labelBn: 'আমাদের সম্পর্কে',
    destination: 'about',
    isActive: true,
    order: 2,
    hasDropdown: true,
    dropdownItems: [
      { id: 'sub-about-overview', labelEn: 'Institutional Overview', labelBn: 'প্রাতিষ্ঠানিক পরিচিতি', destination: 'about', isActive: true, order: 1 },
      { id: 'sub-about-principal', labelEn: "Principal's Message", labelBn: 'অধ্যক্ষের বাণী', destination: 'principal-message', isActive: true, order: 2 },
      { id: 'sub-about-faculty', labelEn: 'Faculty & Teachers Directory', labelBn: 'শিক্ষক ও কর্মচারী বৃন্দ', destination: 'faculty', isActive: true, order: 3 },
      { id: 'sub-about-committee', labelEn: 'Managing Committee & Governance', labelBn: 'ম্যানেজিং কমিটি ও পরিচালনা পর্ষদ', destination: 'committee', isActive: true, order: 4 }
    ]
  },
  {
    id: 'nav-academics',
    labelEn: 'Academics & Curriculum',
    labelBn: 'একাডেমিক কার্যক্রম',
    destination: 'academics',
    isActive: true,
    order: 3
  },
  {
    id: 'nav-admissions',
    labelEn: 'Online Admission',
    labelBn: 'অনলাইন ভর্তি',
    destination: 'admissions',
    isActive: true,
    order: 4
  },
  {
    id: 'nav-results',
    labelEn: 'Results & Marksheet',
    labelBn: 'ফলাফল ও মার্কশিট',
    destination: 'results',
    isActive: true,
    order: 5
  },
  {
    id: 'nav-notices',
    labelEn: 'Notice Board',
    labelBn: 'নোটিশ বোর্ড',
    destination: 'notices',
    isActive: true,
    order: 6
  },
  {
    id: 'nav-news',
    labelEn: 'News & Events',
    labelBn: 'সংবাদ ও ঘটনাবলী',
    destination: 'news',
    isActive: true,
    order: 7
  },
  {
    id: 'nav-gallery',
    labelEn: 'Photo Gallery',
    labelBn: 'ফটো গ্যালারি',
    destination: 'gallery',
    isActive: true,
    order: 8
  },
  {
    id: 'nav-contact',
    labelEn: 'Contact Us',
    labelBn: 'যোগাযোগ',
    destination: 'contact',
    isActive: true,
    order: 9
  }
];

export const INITIAL_WEBSITE_DATA: WebsiteData = {
  settings: {
    schoolName: 'E-Biddalay Model High School & College',
    shortName: 'EBMHSC',
    motto: 'Knowledge, Character, Innovation, and Service',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    faviconUrl: '',
    address: 'Road 12, Dhanmondi R/A, Dhaka-1209, Bangladesh',
    phone: '+880 2 9661234, +880 1711-234567',
    email: 'info@ebiddalay-school.edu.bd',
    schoolDescription: 'E-Biddalay Model High School & College is an esteemed institution renowned for academic brilliance, cutting-edge STEM education, moral discipline, sports, and holistic character building.',
    establishedYear: '1995',
    eiin: '108245',
    principalName: 'Prof. Dr. Mohammad Rafiqul Islam',
    openingHours: 'Saturday - Thursday: 8:00 AM - 4:30 PM (Friday Closed)',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    twitterUrl: 'https://x.com',
    instagramUrl: 'https://instagram.com',
    linkedinUrl: 'https://linkedin.com',
    footerText: 'Committed to fostering independent thinkers, scientific innovators, and ethical global citizens through transformative modern education.',
    copyrightText: '© 2026 E-Biddalay Model High School & College. All Rights Reserved. Web Software Created by Md. Mirabul Hossen.',
    isPublished: true,
    themePrimaryColor: '#1e3a8a',
    themeAccentColor: '#0284c7',
    googleMapEmbedUrl: 'https://maps.google.com/maps?q=Dhanmondi%20Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed',
    showAdmissionBanner: true,
    admissionBannerText: 'Admissions Open for Academic Session 2026-2027 (Classes 1-10 & College XI Science, Humanities, Business Studies). Apply online now!',
    emergencyNotice: 'Annual Examination 2026 Tabulation Schedule and Special Practical Guidelines published. Check Notice Board.',
    showEmergencyNotice: true
  },

  statistics: {
    totalStudentsManual: 1850,
    totalTeachersManual: 64,
    totalClassrooms: 42,
    passRatePercentage: 99.4,
    yearsOfExcellence: 31,
    clubsAndActivities: 18,
    useLiveStudentCount: true,
    useLiveTeacherCount: true
  },

  navigation: INITIAL_WEBSITE_NAVIGATION,

  banners: [
    {
      id: 'banner-1',
      title: 'Inspiring Minds, Shaping Tomorrow',
      subtitle: 'Excellence in Secondary & Higher Secondary Education',
      description: 'Welcome to E-Biddalay Model High School & College. We nurture intellectual curiosity, moral leadership, and creative innovation in every student.',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
      buttonText: 'Apply for Admission',
      buttonLink: 'admissions',
      order: 1,
      isActive: true
    },
    {
      id: 'banner-2',
      title: 'State-of-the-Art STEM & Science Labs',
      subtitle: 'Hands-on Experimental & Practical Learning',
      description: 'Our physics, chemistry, biology, and robotics laboratories provide world-class tools for experiential research and competitive excellence.',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80',
      buttonText: 'Explore Campus',
      buttonLink: 'about',
      order: 2,
      isActive: true
    },
    {
      id: 'banner-3',
      title: '100% Board Pass Rate & Merit Honors',
      subtitle: 'Celebrating Our Board Exam Top Rankers',
      description: 'Our dedicated teachers and modern continuous assessment systems guarantee exceptional results in national board examinations every year.',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
      buttonText: 'View Exam Results',
      buttonLink: 'results',
      order: 3,
      isActive: true
    }
  ],

  principalMessage: {
    title: 'Welcome from the Principal',
    name: 'Prof. Dr. Mohammad Rafiqul Islam',
    designation: 'Principal & Head of Institution (M.Sc, M.Ed, Ph.D)',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    quote: 'Education is not merely the transmission of facts, but the ignition of curiosity, character, and empathy in young minds.',
    content: 'It gives me immense pride to welcome you to E-Biddalay Model High School & College. Over the past three decades, our institution has stood as a beacon of academic rigor, disciplined ethos, and progressive pedagogical innovation in Dhaka.\n\nHere, we believe that every student possesses unique talents waiting to be unleashed. Our distinguished educators combine rigorous academic curricula with vibrant co-curricular pursuits—including science fairs, coding clubs, debating society, and championship athletics. We maintain strong partnerships with parents and guardians to build a compassionate, forward-looking learning community.\n\nI invite you to explore our campus, witness our student achievements, and partner with us in shaping the leaders of tomorrow.',
    isPublished: true
  },

  about: {
    history: 'Founded in 1995 by a group of dedicated educationists and visionaries in Dhanmondi, Dhaka, E-Biddalay Model High School & College commenced its journey with 120 students and 8 teachers. Over three decades of steadfast commitment, the institution expanded into a premier multi-storied campus serving over 1,800 students from primary to higher secondary college levels. Our alumni hold distinguished positions across medicine, engineering, civil service, global academia, and enterprise worldwide.',
    historyMilestones: [
      { year: '1995', title: 'Foundation & Inception', description: 'Established as an English & National Curriculum primary and junior secondary institution.' },
      { year: '2004', title: 'Secondary School Certification (SSC)', description: 'Recognized by Dhaka Education Board with 100% first-batch first-division pass.' },
      { year: '2012', title: 'College Level Expansion (HSC)', description: 'Inauguration of Higher Secondary College section offering Science, Humanities, and Business Studies.' },
      { year: '2018', title: 'Smart Campus & STEM Lab', description: 'Launch of multimedia smart classrooms, modern robotics laboratory, and automated student management system.' },
      { year: '2026', title: 'National Academic Excellence Award', description: 'Awarded top academic institution honor for outstanding GPA-5.00 pass rate and digital governance.' }
    ],
    mission: 'To impart holistic, modern, and value-based education that equips students with critical thinking, scientific competence, moral integrity, and social responsibility.',
    vision: 'To be recognized as a world-class academic center of excellence that empowers young men and women to lead positive change in Bangladesh and the global society.',
    objectives: [
      'Foster independent thinking, intellectual curiosity, and scientific inquiry through interactive learning.',
      'Achieve top-tier performance in national board examinations (SSC and HSC) with consistent 100% pass rates.',
      'Instill ethical values, mutual respect, patriotism, and global citizenship.',
      'Provide vibrant sports, debate, cultural, and community service programs alongside core academics.',
      'Integrate modern digital tools, coding, and multimedia technology across every classroom.'
    ],
    facilities: [
      {
        id: 'fac-1',
        title: 'Smart Multimedia Classrooms',
        description: 'Spacious, climate-controlled classrooms equipped with high-definition digital projectors, interactive smartboards, and ergonomic furniture.',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
        order: 1
      },
      {
        id: 'fac-2',
        title: 'Advanced Science Laboratories',
        description: 'Separate, state-of-the-art physics, chemistry, and biology labs designed according to board standards with specialized demonstration stations.',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
        order: 2
      },
      {
        id: 'fac-3',
        title: 'High-Tech Computer & Robotics Lab',
        description: '60+ networked workstations with high-speed internet, programming software, IoT kits, and robotics kits for hands-on IT literacy.',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        order: 3
      },
      {
        id: 'fac-4',
        title: 'Central Digital Library',
        description: 'A quiet reading sanctuary housing over 15,000 reference books, national journals, competitive exam resources, and an e-book terminal.',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
        order: 4
      },
      {
        id: 'fac-5',
        title: 'Sports Complex & Playground',
        description: 'Outdoor grounds for football, cricket, and athletics, alongside indoor spaces for table tennis, chess, and badminton training.',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
        order: 5
      },
      {
        id: 'fac-6',
        title: 'Auditorium & Cultural Hall',
        description: 'A 600-seat acoustic auditorium for annual cultural programs, science symposiums, national debate competitions, and assemblies.',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
        order: 6
      }
    ],
    achievementsSummary: 'Over the last 5 years, 100% of our SSC and HSC candidates passed with distinction, with over 78% securing GPA-5.00. Our students have won 1st prize in the National Science Olympiad and represented Bangladesh in international debates.'
  },

  facultyProfiles: [
    {
      id: 'fac-p1',
      name: 'Mohammad Kabir Hossain',
      designation: 'Senior Teacher & Head of Science Department',
      department: 'Science & Mathematics',
      subject: 'Physics & Higher Mathematics',
      qualification: 'M.Sc in Applied Physics (DU), B.Ed',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Over 18 years of excellence in preparing students for national board examinations and engineering entrance foundations.',
      email: 'kabir.physics@ebiddalay.edu.bd',
      order: 1,
      isPublished: true
    },
    {
      id: 'fac-p2',
      name: 'Nusrat Sultana',
      designation: 'Senior Assistant Teacher & Debating Coach',
      department: 'Languages',
      subject: 'English Language & Literature',
      qualification: 'M.A in English (DU), ELT Certified',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      bio: 'Passionate language educator and debate trainer whose teams have clinched 14 inter-school championship trophies.',
      email: 'nusrat.english@ebiddalay.edu.bd',
      order: 2,
      isPublished: true
    },
    {
      id: 'fac-p3',
      name: 'Md. Shahidul Alam',
      designation: 'Assistant Teacher & Lab In-Charge',
      department: 'Science',
      subject: 'Chemistry & General Science',
      qualification: 'M.Sc in Chemistry (RU), B.Ed',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      bio: 'Expert in laboratory safety and chemical analysis, making chemistry intuitive and fascinating through hands-on experiments.',
      email: 'shahidul.chem@ebiddalay.edu.bd',
      order: 3,
      isPublished: true
    },
    {
      id: 'fac-p4',
      name: 'Farhana Yasmin',
      designation: 'Assistant Teacher & Cultural Coordinator',
      department: 'Languages',
      subject: 'Bangla Language & Literature',
      qualification: 'M.A in Bangla (JU), B.Ed',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      bio: 'Renowned recitation artist and educator mentoring youth in Bengali literary traditions and essay competitions.',
      email: 'farhana.bangla@ebiddalay.edu.bd',
      order: 4,
      isPublished: true
    },
    {
      id: 'fac-p5',
      name: 'Tanvir Ahmed',
      designation: 'Lecturer & Head of Business Studies',
      department: 'Business Studies',
      subject: 'Accounting & Finance',
      qualification: 'M.Com in Accounting (DU), CA Inter',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      bio: 'Guides commerce stream candidates with real-world financial literacy, case studies, and board exam mastery.',
      email: 'tanvir.commerce@ebiddalay.edu.bd',
      order: 5,
      isPublished: true
    },
    {
      id: 'fac-p6',
      name: 'Shamim Akhter',
      designation: 'ICT Coordinator & Robotics Mentor',
      department: 'Information Technology',
      subject: 'Information & Communication Technology (ICT)',
      qualification: 'B.Sc in Computer Science & Engineering',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
      bio: 'Oversees student programming clubs, Python bootcamps, and robotics projects representing the school in national expos.',
      email: 'shamim.ict@ebiddalay.edu.bd',
      order: 6,
      isPublished: true
    }
  ],

  committeeMembers: [
    {
      id: 'comm-1',
      name: 'Barrister Mahbubur Rahman',
      position: 'President, Managing Committee',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      bio: 'Senior Advocate of the Supreme Court of Bangladesh, philanthropic patron, and educational reformer.',
      order: 1,
      isPublished: true
    },
    {
      id: 'comm-2',
      name: 'Prof. Dr. Mohammad Rafiqul Islam',
      position: 'Member Secretary & Principal',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
      bio: 'Ex-officio Member Secretary leading institutional governance and academic development.',
      order: 2,
      isPublished: true
    },
    {
      id: 'comm-3',
      name: 'Engr. Khairul Anam',
      position: 'Vice President & Infrastructure Director',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      bio: 'Chartered Civil Engineer guiding campus expansion, laboratory modernization, and structural safety.',
      order: 3,
      isPublished: true
    },
    {
      id: 'comm-4',
      name: 'Dr. Salma Begum',
      position: 'Guardian Representative (Female)',
      photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
      bio: 'Associate Professor of Child Health, championing student well-being and parent-teacher synergy.',
      order: 4,
      isPublished: true
    },
    {
      id: 'comm-5',
      name: 'Mohammad Kabir Hossain',
      position: 'Teacher Representative',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Elected teacher representative advocating faculty development and pedagogy advancement.',
      order: 5,
      isPublished: true
    }
  ],

  featuredAwards: [
    {
      id: 'award-1',
      studentName: 'Tahmidur Rahman',
      classGrade: 'Class 10 (Science)',
      awardTitle: 'Champion - National Science Olympiad 2025',
      year: '2025',
      description: 'Secured 1st place in Senior Secondary Physics category out of 12,000 participants nationwide.',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      isPublished: true
    },
    {
      id: 'award-2',
      studentName: 'Zarin Subah',
      classGrade: 'Class 10 (Science)',
      awardTitle: 'Best Speaker - Inter-School English Debate Fest',
      year: '2025',
      description: 'Led our debate squad to victory in the Grand Finale against 32 divisional institutions.',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      isPublished: true
    },
    {
      id: 'award-3',
      studentName: 'Anas Bin Tariq',
      classGrade: 'Class 9 (Science)',
      awardTitle: 'Gold Medal - National Math Olympiad (Junior)',
      year: '2025',
      description: 'Solved all complex problem sets with distinction and received special merit scholarship.',
      photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
      isPublished: true
    }
  ],

  notices: [
    {
      id: 'not-1',
      title: 'Annual Examination 2026 Routine & Examination Guidelines',
      content: 'The official schedule for the upcoming Annual Examination 2026 has been published. All students are instructed to collect their admit cards from the class teacher by November 5. No electronic gadgets or unauthorized stationery are permitted inside the examination hall.',
      category: 'Exam',
      publishDate: '2026-10-20',
      pdfUrl: '#',
      isPinned: true,
      isPublished: true
    },
    {
      id: 'not-2',
      title: 'Admissions Open for Class 1 to Class 9 & Class 11 (Session 2026-2027)',
      content: 'Application forms for new admissions in the upcoming academic session are now available online and at the accounts counter. The online admission portal will remain active until November 30. Merit test dates will be notified via SMS.',
      category: 'Admission',
      publishDate: '2026-10-18',
      pdfUrl: '#',
      isPinned: true,
      isPublished: true
    },
    {
      id: 'not-3',
      title: 'Half-Yearly Marksheets and Tabulation Summaries Available',
      content: 'Parents and guardians are requested to review the verified Half-Yearly examination marksheets on the student portal or by using the public result verification tool with the student roll number.',
      category: 'Academic',
      publishDate: '2026-10-15',
      pdfUrl: '#',
      isPinned: false,
      isPublished: true
    },
    {
      id: 'not-4',
      title: 'Inter-House Annual Sports & Athletics Meet 2026 Schedule',
      content: 'The 31st Annual Sports Meet will be held on the school playground from November 12 to November 14. House captains and interested participants must submit registration slips to the Physical Education department.',
      category: 'General',
      publishDate: '2026-10-10',
      pdfUrl: '#',
      isPinned: false,
      isPublished: true
    },
    {
      id: 'not-5',
      title: 'Science Fair & Robotics Project Exhibition Registration',
      content: 'All students of Class 6 to Class 10 and College section are invited to register team projects for the upcoming Annual Science Fest. Prototype categories include Green Energy, AI & Automation, and Environmental Science.',
      category: 'Academic',
      publishDate: '2026-10-05',
      pdfUrl: '#',
      isPinned: false,
      isPublished: true
    }
  ],

  newsArticles: [
    {
      id: 'news-1',
      title: 'Grand Annual Science, Robotics & Innovation Fair 2026 Concludes',
      type: 'news',
      summary: 'Over 85 student projects were showcased, featuring automatic solar irrigators, AI emergency detectors, and clean energy prototypes.',
      content: 'The three-day Annual Science & Robotics Expo concluded yesterday amidst enthusiastic participation from parents, distinguished university scientists, and over 1,500 visitors. Prof. Dr. Mohammad Rafiqul Islam commended the students for their ingenious engineering prototypes, stating that early STEM inquiry is the cornerstone of sustainable nation-building.',
      imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
      date: '2026-10-21',
      eventLocation: 'Campus Central Auditorium',
      isPublished: true
    },
    {
      id: 'news-2',
      title: 'National Victory Day Cultural Symposium & Art Competition',
      type: 'event',
      summary: 'Commemorating our national heritage through patriotic songs, speech competitions, and canvas exhibitions.',
      content: 'Our institution will host a solemn and colorful Victory Day cultural ceremony on December 16. The program features patriotic poetry recitation, historical documentary screenings, and an inter-class art exhibition celebrating our liberation history.',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      date: '2026-12-16',
      eventLocation: 'Main Campus Playground & Stage',
      isPublished: true
    },
    {
      id: 'news-3',
      title: 'Parent-Teacher Conference & Academic Counseling Session Held',
      type: 'news',
      summary: 'Constructive dialogue on individual student progress, continuous evaluation, and mental wellness strategies.',
      content: 'Over 1,200 parents joined our faculty members last Saturday for the semesterly Parent-Teacher Conference. Discussions focused on personalized academic coaching, board exam preparations, and the balanced integration of extracurricular activities with study routines.',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      date: '2026-10-12',
      eventLocation: 'Campus Academic Blocks',
      isPublished: true
    }
  ],

  galleryAlbums: [
    {
      id: 'album-1',
      title: 'Campus Life & Smart Classrooms',
      category: 'Campus',
      coverUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
      isPublished: true,
      images: [
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80', caption: 'Interactive Multimedia Smart Classroom in Session', category: 'Campus', order: 1 },
        { id: 'img-2', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80', caption: 'Lush Green Front Yard & Academic Building', category: 'Campus', order: 2 },
        { id: 'img-3', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80', caption: 'Students Reading at Central Digital Library', category: 'Campus', order: 3 }
      ]
    },
    {
      id: 'album-2',
      title: 'Science Laboratories & Innovation Lab',
      category: 'Science',
      coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      isPublished: true,
      images: [
        { id: 'img-4', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80', caption: 'Practical Chemistry Experimentation in Advanced Lab', category: 'Science', order: 1 },
        { id: 'img-5', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80', caption: 'Computer & Robotics Coding Session', category: 'Science', order: 2 },
        { id: 'img-6', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&auto=format&fit=crop&q=80', caption: 'Secondary Physics Optics & Electronics Demonstrations', category: 'Science', order: 3 }
      ]
    },
    {
      id: 'album-3',
      title: 'Annual Sports, Debates & Cultural Events',
      category: 'Events',
      coverUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
      isPublished: true,
      images: [
        { id: 'img-7', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80', caption: 'Annual Inter-House Football Championship Final', category: 'Events', order: 1 },
        { id: 'img-8', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80', caption: 'Prize Giving Ceremony at Central Auditorium', category: 'Events', order: 2 },
        { id: 'img-9', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80', caption: 'Graduation & Board GPA-5.00 Reception Ceremony', category: 'Events', order: 3 }
      ]
    }
  ],

  downloads: [
    {
      id: 'dl-1',
      title: 'Student Admission Application Form (Session 2026-2027)',
      category: 'Admission Form',
      fileUrl: '#',
      fileSize: '420 KB',
      publishDate: '2026-10-18',
      isPublished: true
    },
    {
      id: 'dl-2',
      title: 'Official Academic Calendar & Holidays 2026',
      category: 'Academic Calendar',
      fileUrl: '#',
      fileSize: '650 KB',
      publishDate: '2026-01-05',
      isPublished: true
    },
    {
      id: 'dl-3',
      title: 'Half-Yearly & Annual Examination Syllabus (Classes 6-10)',
      category: 'Syllabus',
      fileUrl: '#',
      fileSize: '1.2 MB',
      publishDate: '2026-02-10',
      isPublished: true
    },
    {
      id: 'dl-4',
      title: 'Weekly Master Class Routine & Shift Timing Schedule',
      category: 'Routine',
      fileUrl: '#',
      fileSize: '380 KB',
      publishDate: '2026-08-15',
      isPublished: true
    },
    {
      id: 'dl-5',
      title: 'Institutional Code of Conduct, Discipline & Uniform Policy',
      category: 'Rules & Guidelines',
      fileUrl: '#',
      fileSize: '290 KB',
      publishDate: '2026-01-10',
      isPublished: true
    }
  ],

  customPages: [
    {
      id: 'page-library',
      slug: 'library-resources',
      title: 'Central Library & Digital Knowledge Hub',
      subtitle: 'Nurturing Reading Habits, Research, and Lifelong Inquiry',
      metaDescription: 'Explore the central digital library resources, book catalog, reading hours, and digital archives at E-Biddalay Model School.',
      showInNav: true,
      showInFooter: true,
      navOrder: 1,
      isPublished: true,
      updatedAt: '2026-10-22',
      sections: [
        {
          id: 'sec-lib-hero',
          type: 'hero',
          heading: 'Central Library & Digital Archives',
          subheading: 'A sanctuary of over 15,000 titles, literary classics, and modern research resources.',
          imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
          buttonText: 'View Library Rules',
          buttonLink: '#rules',
          order: 1,
          isActive: true
        },
        {
          id: 'sec-lib-features',
          type: 'features',
          heading: 'Key Library Facilities & Collections',
          subheading: 'Everything students and faculty need for academic depth and intellectual enrichment.',
          items: [
            { title: '15,000+ Printed Titles', description: 'Curated curriculum texts, world literature, historical encyclopedias, and board exam guides.' },
            { title: 'Digital E-Reader Hub', description: 'Terminals providing access to national e-books, journals, and digital periodicals.' },
            { title: 'Quiet Study Sanctuary', description: 'Sound-dampened reading halls accommodating over 120 students concurrently.' },
            { title: 'Automated Barcode Circulation', description: 'Instant lending and return system integrated directly with student ID cards.' }
          ],
          order: 2,
          isActive: true
        },
        {
          id: 'sec-lib-text',
          type: 'text',
          heading: 'Library Hours & Borrowing Guidelines',
          content: 'The library remains open Sunday through Thursday from 8:30 AM to 4:00 PM. Students can borrow up to two books at a time for a 14-day duration. Digital catalog searches can be performed at the librarian desk.\n\nAll students must preserve a peaceful environment, avoid food or drinks in reading halls, and handle books with utmost respect.',
          order: 3,
          isActive: true
        }
      ]
    },
    {
      id: 'page-transport',
      slug: 'transport-campus-safety',
      title: 'Transport Services & Campus Safety',
      subtitle: 'Safe, Monitored, and Timely Daily Commutes Across Dhaka',
      metaDescription: 'Learn about school bus routes, GPS tracking, and campus security protocols.',
      showInNav: true,
      showInFooter: true,
      navOrder: 2,
      isPublished: true,
      updatedAt: '2026-10-20',
      sections: [
        {
          id: 'sec-trans-hero',
          type: 'hero',
          heading: 'Dedicated School Bus Fleet with GPS Tracking',
          subheading: 'Ensuring safe, comfortable, and punctually monitored journeys for our students.',
          imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&auto=format&fit=crop&q=80',
          buttonText: 'Contact Transport Office',
          buttonLink: 'contact',
          order: 1,
          isActive: true
        },
        {
          id: 'sec-trans-features',
          type: 'features',
          heading: 'Safety Protocols & Route Coverage',
          items: [
            { title: 'Full GPS Live Tracking', description: 'Parents receive real-time location updates and arrival estimates on dedicated channels.' },
            { title: 'Certified Experienced Drivers', description: 'All bus operators undergo background checks, defensive driving tests, and first-aid drills.' },
            { title: 'Female Bus Attendants', description: 'Dedicated staff onboard every bus to assist primary students and maintain discipline.' },
            { title: 'Covering Major Routes', description: 'Routes spanning Dhanmondi, Mirpur, Mohammadpur, Lalmatia, Kalabagan, and Green Road.' }
          ],
          order: 2,
          isActive: true
        }
      ]
    }
  ],

  contactMessages: [
    {
      id: 'msg-1',
      name: 'Dr. Shahabuddin Ahmed',
      email: 'shahabuddin.ahmed@yahoo.com',
      phone: '+880 1715-667788',
      subject: 'Inquiry regarding Class 9 Science stream admission criteria',
      message: 'Hello, I would like to know if admission test forms for Class 9 Science are available online, and what is the minimum GPA requirement from Class 8. Thank you.',
      submittedAt: '2026-10-21 14:30',
      status: 'read',
      notes: 'Replied via phone on Oct 22. Father of Anika Tabassum.'
    },
    {
      id: 'msg-2',
      name: 'Salma Khatun',
      email: 'salma.khatun@gmail.com',
      phone: '+880 1819-234567',
      subject: 'School bus route query for Mirpur 10',
      message: 'Does the school bus service cover Mirpur Section 10 for the Morning Shift? Please inform the route timings.',
      submittedAt: '2026-10-22 09:15',
      status: 'unread'
    }
  ],

  admissionInquiries: [
    {
      id: 'inq-1',
      studentName: 'Ahsan Habib',
      gender: 'Male',
      dateOfBirth: '2013-05-14',
      applyingClass: 'Class 7',
      shiftPreference: 'Day Shift',
      guardianName: 'Habibur Rahman',
      guardianPhone: '+880 1912-345678',
      guardianEmail: 'habibur.dhaka@gmail.com',
      address: 'House 45, Road 7, Dhanmondi, Dhaka',
      previousSchool: 'Ideal Preparatory School',
      submittedAt: '2026-10-20 11:45',
      status: 'reviewed',
      notes: 'Eligible for written assessment on Nov 12.'
    }
  ]
};
