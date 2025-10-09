// app/customer/profile/page.tsx
import { CustomerLayout } from "@/components/customer-layout";
import ProfileClient from "@/components/customer/profile/ProfileClient";
import { getCompanyProfile } from "@/lib/api";
import type { ProfileData, UploadedDocument, DocumentType, Stats } from "@/components/customer/profile/types";

// Fetch real data from API
export default async function ProfilePage() {
  let profileData: ProfileData;
  let stats: Stats;
  
  try {
    const response = await getCompanyProfile();
    profileData = response.data;
    
    // Transform API data to stats format
    stats = {
      projectsPosted: profileData.customerProfile.projectsPosted,
      rating: profileData.customerProfile.rating,
      reviewCount: profileData.customerProfile.reviewCount,
      totalSpend: profileData.customerProfile.totalSpend,
      completion: profileData.customerProfile.completion,
      lastActiveAt: profileData.customerProfile.lastActiveAt,
      memberSince: new Date(profileData.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
    };
  } catch (error) {
    console.error("Failed to fetch profile data:", error);
    // Fallback to mock data if API fails
    profileData = {
      email: "company33@example.com",
      name: "My Company",
      phone: "12345678",
      isVerified: false,
      kycStatus: "pending_verification",
      createdAt: "2025-10-07T16:08:24.606Z",
      customerProfile: {
        description: "A test company providing IT solutions",
        industry: "IT",
        location: "Kuala Lumpur",
        website: "https://mycompany.com",
        logoUrl: "https://mycompany.com/logo.png",
        socialLinks: [
          "https://linkedin.com/company/mycompany",
          "https://twitter.com/mycompany"
        ],
        languages: ["English", "Malay"],
        companySize: "50-200 employees",
        employeeCount: 120,
        establishedYear: 2015,
        annualRevenue: "5000000",
        fundingStage: "Series A",
        preferredContractTypes: ["Fixed-price", "Hourly"],
        averageBudgetRange: "50,000 - 200,000 USD",
        remotePolicy: "Hybrid",
        hiringFrequency: "Quarterly",
        categoriesHiringFor: ["Software Development", "UI/UX Design"],
        completion: 100,
        rating: 4.5,
        reviewCount: 10,
        totalSpend: "1000000",
        projectsPosted: 25,
        lastActiveAt: "2025-10-02T16:21:11.436Z",
        mission: "To empower businesses with innovative IT solutions",
        values: ["Innovation", "Integrity", "Customer-first"],
        benefits: "Flexible working hours, health insurance, annual bonuses",
        mediaGallery: [
          "https://mycompany.com/images/office1.jpg",
          "https://mycompany.com/images/office2.jpg"
        ]
      },
      kycDocuments: []
    };
    
    stats = {
      projectsPosted: profileData.customerProfile.projectsPosted,
      rating: profileData.customerProfile.rating,
      reviewCount: profileData.customerProfile.reviewCount,
      totalSpend: profileData.customerProfile.totalSpend,
      completion: profileData.customerProfile.completion,
      lastActiveAt: profileData.customerProfile.lastActiveAt,
      memberSince: new Date(profileData.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }),
    };
  }

  const uploadedDocuments: UploadedDocument[] = [
    { id: "1", name: "Business_Registration_Certificate.pdf", type: "Business Registration", size: "2.4 MB", uploadDate: "2024-01-15", status: "approved" as const },
    { id: "2", name: "Tax_Identification_Number.pdf", type: "Tax Document", size: "1.8 MB", uploadDate: "2024-01-15", status: "approved" as const },
    { id: "3", name: "Bank_Account_Statement.pdf", type: "Bank Statement", size: "3.2 MB", uploadDate: "2024-01-20", status: "pending" as const },
  ];

  const documentTypes: DocumentType[] = [
    { value: "business_registration", label: "Business Registration Certificate (SSM)" },
    { value: "tax_document", label: "Tax Identification Number" },
    { value: "bank_statement", label: "Bank Account Statement" },
    { value: "company_profile", label: "Company Profile/Brochure" },
    { value: "director_id", label: "Director's Identification (IC/Passport)" },
    { value: "authorization_letter", label: "Authorization Letter" },
    { value: "financial_statement", label: "Financial Statement" },
    { value: "other", label: "Other Documents" },
  ];

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
