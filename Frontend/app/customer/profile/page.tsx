// app/customer/profile/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProfileClient from "@/components/customer/profile/ProfileClient";

// Move static/mock data to the server page (or fetch here)
// Then pass as props to the client component
export default async function ProfilePage() {
  const profileData = {
    firstName: "Ahmad",
    lastName: "Rahman",
    email: "ahmad.rahman@email.com",
    phone: "+60123456789",
    company: "Tech Innovations Sdn Bhd",
    position: "IT Director",
    industry: "Technology",
    companySize: "medium",
    address: "Jalan Ampang, Kuala Lumpur",
    city: "Kuala Lumpur",
    state: "Kuala Lumpur",
    postalCode: "50450",
    bio: "Experienced IT professional with over 10 years in technology leadership. Passionate about digital transformation and innovative solutions.",
    website: "https://techinnovations.com.my",
    linkedin: "https://linkedin.com/in/ahmadrahman",
  };

  const uploadedDocuments = [
    { id: "1", name: "Business_Registration_Certificate.pdf", type: "Business Registration", size: "2.4 MB", uploadDate: "2024-01-15", status: "approved" as const },
    { id: "2", name: "Tax_Identification_Number.pdf", type: "Tax Document", size: "1.8 MB", uploadDate: "2024-01-15", status: "approved" as const },
    { id: "3", name: "Bank_Account_Statement.pdf", type: "Bank Statement", size: "3.2 MB", uploadDate: "2024-01-20", status: "pending" as const },
  ];

  const documentTypes = [
    { value: "business_registration", label: "Business Registration Certificate (SSM)" },
    { value: "tax_document", label: "Tax Identification Number" },
    { value: "bank_statement", label: "Bank Account Statement" },
    { value: "company_profile", label: "Company Profile/Brochure" },
    { value: "director_id", label: "Director's Identification (IC/Passport)" },
    { value: "authorization_letter", label: "Authorization Letter" },
    { value: "financial_statement", label: "Financial Statement" },
    { value: "other", label: "Other Documents" },
  ];

  const stats = {
    projectsPosted: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalSpent: 85000,
    averageRating: 4.8,
    responseTime: "2 hours",
    memberSince: "January 2023",
    successRate: 95,
  };

  return (
    <CustomerLayout>
      <ProfileClient
        profileData={profileData}
        uploadedDocuments={uploadedDocuments}
        documentTypes={documentTypes}
        stats={stats}
      />
    </CustomerLayout>
  );
}
