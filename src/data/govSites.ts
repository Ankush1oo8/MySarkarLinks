import { GovSite } from "@/components/GovSiteCard";

export const govSitesData: Omit<GovSite, "comments" | "avgRating">[] = [
  {
    id: "1",
    title: "National Portal of India",
    url: "https://www.india.gov.in",
    description: "Single-window gateway to all central and state government services, news, forms, tenders and directories.",
    category: "General Services"
  },
  {
    id: "2", 
    title: "MyGov",
    url: "https://www.mygov.in",
    description: "Citizen-engagement platform for discussions, tasks, polls and feedback on government initiatives.",
    category: "Citizen Engagement"
  },
  {
    id: "3",
    title: "Prime Minister's Office",
    url: "https://www.pmindia.gov.in",
    description: "Official site of the Prime Minister's Office—announcements, speeches, policies and press releases.",
    category: "Leadership"
  },
  {
    id: "4",
    title: "Ministry of Home Affairs",
    url: "https://www.mha.gov.in",
    description: "Internal security, border management, citizenship, disaster management and public grievances.",
    category: "Security & Administration"
  },
  {
    id: "5",
    title: "Ministry of Finance",
    url: "https://finmin.nic.in",
    description: "Budget, tax policy, financial sector regulation, public debt and expenditure management.",
    category: "Finance & Economics"
  },
  {
    id: "6",
    title: "Ministry of External Affairs",
    url: "https://www.mea.gov.in",
    description: "India's foreign policy, diplomatic missions, consular services and international treaties.",
    category: "Foreign Affairs"
  },
  {
    id: "7",
    title: "Ministry of Defence",
    url: "https://www.mod.gov.in",
    description: "Defence policy, armed forces oversight, procurement and veterans' affairs.",
    category: "Defence"
  },
  {
    id: "8",
    title: "Ministry of Railways",
    url: "https://indianrailways.gov.in",
    description: "Railway network operations, passenger services, freight management and online ticketing (IRCTC).",
    category: "Transportation"
  },
  {
    id: "9",
    title: "Ministry of Health & Family Welfare",
    url: "https://www.mohfw.gov.in",
    description: "National health policy, family welfare programs, disease control and medical education.",
    category: "Health & Welfare"
  },
  {
    id: "10",
    title: "Ministry of Education",
    url: "https://www.education.gov.in",
    description: "School education, higher education, scholarships, e-learning initiatives and teacher training.",
    category: "Education"
  },
  {
    id: "11",
    title: "Ministry of Agriculture & Farmers Welfare",
    url: "https://agricoop.nic.in",
    description: "Agricultural policy, farmer schemes, commodity pricing, market intelligence and credit support.",
    category: "Agriculture"
  },
  {
    id: "12",
    title: "Ministry of Electronics & Information Technology",
    url: "https://www.meity.gov.in",
    description: "Digital India programs, IT policy, cybersecurity, e-governance and emerging technologies.",
    category: "Technology"
  },
  {
    id: "13",
    title: "Ministry of Environment, Forest & Climate Change",
    url: "https://moef.gov.in",
    description: "Environmental protection, climate action, wildlife conservation and environmental impact assessments.",
    category: "Environment"
  },
  {
    id: "14",
    title: "Ministry of Labour & Employment",
    url: "https://labour.gov.in",
    description: "Labour laws, social security, skill development, employment services and worker welfare programs.",
    category: "Employment"
  },
  {
    id: "15",
    title: "Ministry of Women & Child Development",
    url: "https://wcd.nic.in",
    description: "Women's empowerment, child welfare schemes, juvenile justice and protection policies.",
    category: "Social Welfare"
  },
  {
    id: "16",
    title: "Ministry of Housing & Urban Affairs",
    url: "https://mohua.gov.in",
    description: "Urban planning, housing schemes (PMAY), smart cities mission and urban infrastructure development.",
    category: "Urban Development"
  },
  {
    id: "17",
    title: "Ministry of Petroleum & Natural Gas",
    url: "https://petroleum.nic.in",
    description: "Hydrocarbon exploration, refining, distribution, subsidies and new energy transitions.",
    category: "Energy"
  },
  {
    id: "18",
    title: "Ministry of New & Renewable Energy",
    url: "https://mnre.gov.in",
    description: "Solar, wind, bioenergy, policy incentives and renewable integration targets.",
    category: "Energy"
  },
  {
    id: "19",
    title: "Open Government Data Platform",
    url: "https://data.gov.in",
    description: "Central repository of open datasets, APIs and data-driven apps published by government entities.",
    category: "Data & Analytics"
  },
  {
    id: "20",
    title: "Integrated Government Online Directory",
    url: "https://igod.gov.in",
    description: "Browse all central ministries, departments, statutory bodies, PSUs and field offices by category.",
    category: "General Services"
  }
];

export const categories = Array.from(new Set(govSitesData.map(site => site.category))).sort();