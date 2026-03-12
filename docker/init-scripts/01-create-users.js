// Switch to the application database
db = db.getSiblingDB('student-placement');

// Create application user with read/write permissions
db.createUser({
  user: "app_user",
  pwd: "app_password123",
  roles: [
    { role: "readWrite", db: "student-placement" }
  ]
});

// Create collections with validation
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "department"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email and is required"
        },
        department: {
          bsonType: "string",
          description: "must be a string and is required"
        }
      }
    }
  }
});

db.createCollection("jobs");
db.createCollection("matches");
db.createCollection("users");

// Create indexes for better performance
db.students.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "department": 1 });
db.students.createIndex({ "matchScore": -1 });

db.jobs.createIndex({ "title": "text", "company": "text" });
db.jobs.createIndex({ "skills": 1 });
db.jobs.createIndex({ "active": 1, "postedDate": -1 });

db.matches.createIndex({ "studentId": 1, "jobId": 1 }, { unique: true });
db.matches.createIndex({ "score": -1 });
db.matches.createIndex({ "status": 1 });

// Insert sample data
print("Creating sample data...");

// Sample students
db.students.insertMany([
  {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    department: "Computer Science",
    graduationYear: 2024,
    skills: [
      { name: "Python", level: "advanced", yearsOfExperience: 3 },
      { name: "React", level: "intermediate", yearsOfExperience: 2 }
    ],
    matchScore: 98,
    status: "active",
    createdAt: new Date()
  },
  {
    name: "Alex Kumar",
    email: "alex.kumar@example.com",
    department: "Data Science",
    graduationYear: 2024,
    skills: [
      { name: "Python", level: "advanced", yearsOfExperience: 4 },
      { name: "SQL", level: "advanced", yearsOfExperience: 3 }
    ],
    matchScore: 94,
    status: "active",
    createdAt: new Date()
  }
]);

// Sample jobs
db.jobs.insertMany([
  {
    title: "Senior Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    remote: false,
    salary: { min: 150000, max: 220000, currency: "USD" },
    skills: ["Python", "Java", "System Design"],
    type: "fulltime",
    active: true,
    postedDate: new Date()
  },
  {
    title: "Data Scientist",
    company: "Microsoft",
    location: "Redmond, WA",
    remote: true,
    salary: { min: 140000, max: 200000, currency: "USD" },
    skills: ["Python", "Machine Learning", "SQL"],
    type: "fulltime",
    active: true,
    postedDate: new Date()
  }
]);

print("Sample data created successfully!");

// Switch to admin database and show status
db = db.getSiblingDB('admin');
print("Database initialization completed!");