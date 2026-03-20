/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  CloudUpload,
  Settings, 
  Image as ImageIcon, 
  Copy, 
  Download, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle,
  X,
  Sun,
  Moon,
  Monitor,
  Loader2,
  MessageSquare,
  Calendar,
  Edit3,
  Eraser,
  FileText,
  FileArchive,
  FileSpreadsheet,
  Menu,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Info,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import JSZip from 'jszip';

interface FileData {
  id: string;
  file: File;
  previewFile?: File;
  preview: string;
  title: string;
  description: string;
  keywords: string;
  category: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  error?: string;
  customFilename?: string;
  type: 'image' | 'vector' | 'video';
}

const MICROSTOCK_CATEGORIES = [
  "Animals",
  "Architecture",
  "Business",
  "Education",
  "Food & Drink",
  "Health & Beauty",
  "Holidays",
  "Industrial",
  "Nature",
  "People",
  "Sports",
  "Technology",
  "Transportation",
  "Travel",
  "Other"
];

const GLOBAL_CALENDAR_DATA = [
  {
    month: "January",
    badge: "NEW YEAR & HEALTH",
    keyDates: [
      { date: "Jan 01", event: "New Year's Day" },
      { date: "Jan 20", event: "Martin Luther King Jr. Day" },
      { date: "Jan 29", event: "Lunar New Year (Year of the Snake)" }
    ],
    submitNow: ["Easter Sunday", "Earth Day", "Mother's Day", "Spring Outdoors"],
    keywords: ["fitness", "resolutions", "detox", "healthy eating", "organization", "spring flowers", "gardening"]
  },
  {
    month: "February",
    badge: "LOVE & INCLUSION",
    keyDates: [
      { date: "Feb 01", event: "Black History Month Begins" },
      { date: "Feb 14", event: "Valentine's Day" },
      { date: "Feb 17", event: "Presidents' Day (USA)" }
    ],
    submitNow: ["Pride Month", "Father's Day", "Graduation Season", "Summer Vacation"],
    keywords: ["romance", "gift", "heart", "civil rights", "equality", "beach", "summer fashion", "travel"]
  },
  {
    month: "March",
    badge: "RENEWAL & NATURE",
    keyDates: [
      { date: "Mar 08", event: "Intl. Women's Day" },
      { date: "Mar 17", event: "St. Patrick's Day" },
      { date: "Mar 20", event: "Spring Equinox" },
      { date: "Mar 31", event: "Ramadan Begins (Approx)" }
    ],
    submitNow: ["4th of July", "Back to School (USA)", "Summer Festivals"],
    keywords: ["empowerment", "clover", "greenery", "fresh start", "outdoor activities", "hiking", "picnic"]
  },
  {
    month: "April",
    badge: "ENVIRONMENT & FAITH",
    keyDates: [
      { date: "Apr 15", event: "Tax Day (USA)" },
      { date: "Apr 20", event: "Easter Sunday" },
      { date: "Apr 22", event: "Earth Day" }
    ],
    submitNow: ["Autumn / Fall Foliage", "Halloween", "Winter Prep"],
    keywords: ["recycling", "sustainability", "bunny", "eggs", "finance", "accounting", "growth", "savings"]
  },
  {
    month: "May",
    badge: "FAMILY & CELEBRATION",
    keyDates: [
      { date: "May 05", event: "Cinco de Mayo" },
      { date: "May 11", event: "Mother's Day" },
      { date: "May 26", event: "Memorial Day" }
    ],
    submitNow: ["Black Friday", "Cyber Monday", "Thanksgiving", "Christmas Early Bird"],
    keywords: ["moms", "family brunch", "patriotism", "shopping", "holiday planning", "gift guide", "winter fashion"]
  },
  {
    month: "June",
    badge: "OUTDOORS & FREEDOM",
    keyDates: [
      { date: "Jun 08", event: "World Oceans Day" },
      { date: "Jun 15", event: "Father's Day" },
      { date: "Jun 19", event: "Juneteenth" },
      { date: "Jun 21", event: "Summer Solstice" }
    ],
    submitNow: ["Christmas Peak", "Hanukkah", "New Year's Eve 2026"],
    keywords: ["dads", "grilling", "beach cleanup", "diversity", "pride", "sunshine", "camping", "barbecue"]
  },
  {
    month: "July",
    badge: "PEAK SUMMER",
    keyDates: [
      { date: "Jul 01", event: "Canada Day" },
      { date: "Jul 04", event: "Independence Day (USA)" },
      { date: "Jul 17", event: "World Emoji Day" }
    ],
    submitNow: ["Valentine's Day 2026", "Super Bowl 2026", "Winter Sports"],
    keywords: ["fireworks", "picnic", "national pride", "digital communication", "travel", "vacation rental"]
  },
  {
    month: "August",
    badge: "EDUCATION & YOUTH",
    keyDates: [
      { date: "Aug 01", event: "Back to School Peak" },
      { date: "Aug 12", event: "International Youth Day" },
      { date: "Aug 19", event: "World Photography Day" }
    ],
    submitNow: ["Easter 2026", "Spring Break 2026", "Corporate Tax Season"],
    keywords: ["students", "learning", "classroom", "youth culture", "creativity", "spring prep", "office"]
  },
  {
    month: "September",
    badge: "PROFESSIONAL FALL",
    keyDates: [
      { date: "Sep 01", event: "Labor Day" },
      { date: "Sep 21", event: "International Day of Peace" },
      { date: "Sep 22", event: "Fall Equinox" }
    ],
    submitNow: ["Mother's Day 2026", "Summer 2026 Vacation"],
    keywords: ["autumn leaves", "cozy", "business strategy", "meeting", "peace", "harvest", "sweater weather"]
  },
  {
    month: "October",
    badge: "CELEBRATION & COLOR",
    keyDates: [
      { date: "Oct 13", event: "Indigenous Peoples' Day" },
      { date: "Oct 24", event: "United Nations Day" },
      { date: "Oct 31", event: "Halloween" }
    ],
    submitNow: ["Graduation 2026", "Father's Day 2026"],
    keywords: ["pumpkin", "costume", "spooky", "fall harvest", "global unity", "thanksgiving prep"]
  },
  {
    month: "November",
    badge: "GRATITUDE & RETAIL",
    keyDates: [
      { date: "Nov 11", event: "Veterans Day" },
      { date: "Nov 27", event: "Thanksgiving (USA)" },
      { date: "Nov 28", event: "Black Friday" }
    ],
    submitNow: ["Back to School 2026", "Independence Day July"],
    keywords: ["ecommerce", "shopping", "discount", "family dinner", "gratitude", "turkey", "winter coats"]
  },
  {
    month: "December",
    badge: "HOLIDAY MAGIC",
    keyDates: [
      { date: "Dec 24", event: "Christmas Eve" },
      { date: "Dec 25", event: "Christmas Day" },
      { date: "Dec 31", event: "New Year's Eve" }
    ],
    submitNow: ["Easter 2026 Peak", "Spring Fashion 2026"],
    keywords: ["gifts", "snow", "celebration", "fireworks", "resolutions", "party", "winter solstice"]
  }
];

const INDIA_CALENDAR_DATA = [
  {
    month: "January",
    badge: "FESTIVALS & HARVEST",
    keyDates: [
      { date: "Jan 14", event: "Makar Sankranti / Pongal" },
      { date: "Jan 26", event: "Republic Day" }
    ],
    submitNow: ["Holi", "Baisakhi", "Summer Weddings"],
    keywords: ["rangoli", "harvest", "kite flying", "tricolor", "traditional wear", "indian flag"]
  },
  {
    month: "February",
    badge: "DEVOTION & SPRING",
    keyDates: [
      { date: "Feb 01", event: "Vasant Panchami" },
      { date: "Feb 15", event: "Maha Shivratri" }
    ],
    submitNow: ["Rama Navami", "Eid-ul-Fitr", "Monsoon Prep"],
    keywords: ["yellow", "saraswati puja", "shiva", "temple", "spring blossoms", "devotion"]
  },
  {
    month: "March",
    badge: "COLORS & CELEBRATION",
    keyDates: [
      { date: "Mar 03", event: "Holi" },
      { date: "Mar 20", event: "Eid-ul-Fitr" },
      { date: "Mar 28", event: "Rama Navami" }
    ],
    submitNow: ["Independence Day", "Raksha Bandhan"],
    keywords: ["gulal", "pichkari", "sweets", "mosque", "prayer", "ramadan", "indian culture"]
  },
  {
    month: "April",
    badge: "NEW YEAR & HARVEST",
    keyDates: [
      { date: "Apr 14", event: "Ambedkar Jayanti / Baisakhi" },
      { date: "Apr 15", event: "Vishu / Poila Baisakh" }
    ],
    submitNow: ["Ganesh Chaturthi", "Onam"],
    keywords: ["punjabi culture", "bhangra", "harvest", "bengali new year", "traditional food"]
  },
  {
    month: "May",
    badge: "SUMMER & SPIRITUALITY",
    keyDates: [
      { date: "May 01", event: "Buddha Purnima" }
    ],
    submitNow: ["Dussehra", "Durga Puja"],
    keywords: ["meditation", "peace", "summer heat", "mangoes", "vacation", "indian summer"]
  },
  {
    month: "June",
    badge: "MONSOON & CHARIOTS",
    keyDates: [
      { date: "Jun 15", event: "Rath Yatra" }
    ],
    submitNow: ["Diwali", "Bhai Dooj"],
    keywords: ["rain", "umbrella", "puri rath yatra", "lord jagannath", "clouds", "monsoon india"]
  },
  {
    month: "July",
    badge: "TEACHERS & TRADITION",
    keyDates: [
      { date: "Jul 29", event: "Guru Purnima" }
    ],
    submitNow: ["Chhath Puja", "Winter Weddings"],
    keywords: ["guru", "respect", "spiritual", "monsoon greenery", "indian tradition"]
  },
  {
    month: "August",
    badge: "FREEDOM & BONDS",
    keyDates: [
      { date: "Aug 15", event: "Independence Day" },
      { date: "Aug 27", event: "Raksha Bandhan" }
    ],
    submitNow: ["New Year 2027", "Makar Sankranti 2027"],
    keywords: ["flag", "patriotism", "rakhi", "brother sister", "gifts", "sweets", "indian pride"]
  },
  {
    month: "September",
    badge: "DEVOTION & CULTURE",
    keyDates: [
      { date: "Sep 04", event: "Janmashtami" },
      { date: "Sep 14", event: "Ganesh Chaturthi" },
      { date: "Sep 22", event: "Onam" }
    ],
    submitNow: ["Republic Day 2027"],
    keywords: ["krishna", "dahi handi", "ganpati", "modak", "boat race", "pookalam", "festival"]
  },
  {
    month: "October",
    badge: "VICTORY & HERITAGE",
    keyDates: [
      { date: "Oct 02", event: "Gandhi Jayanti" },
      { date: "Oct 11", event: "Durga Puja Begins" },
      { date: "Oct 20", event: "Dussehra" }
    ],
    submitNow: ["Holi 2027"],
    keywords: ["non-violence", "khadi", "pandal", "goddess durga", "ravana dahan", "celebration"]
  },
  {
    month: "November",
    badge: "LIGHTS & GRATITUDE",
    keyDates: [
      { date: "Nov 08", event: "Diwali" },
      { date: "Nov 10", event: "Bhai Dooj" },
      { date: "Nov 16", event: "Chhath Puja" }
    ],
    submitNow: ["Summer 2027"],
    keywords: ["diyas", "crackers", "lights", "family gathering", "sun worship", "deepavali"]
  },
  {
    month: "December",
    badge: "WINTER & FAITH",
    keyDates: [
      { date: "Dec 25", event: "Christmas" }
    ],
    submitNow: ["Monsoon 2027"],
    keywords: ["cake", "party", "winter chill", "travel", "year end", "indian winter"]
  }
];

const ContentCalendar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [region, setRegion] = useState<'Global' | 'India'>('Global');
  const currentData = region === 'Global' ? GLOBAL_CALENDAR_DATA : INDIA_CALENDAR_DATA;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-medium text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Plan your shoots 3-4 months ahead. Stock buyers search for seasonal content long before the event occurs.
        </h2>
        
        <div className={`inline-flex p-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <button 
            onClick={() => setRegion('Global')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${region === 'Global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
          >
            <Globe size={16} /> Global
          </button>
          <button 
            onClick={() => setRegion('India')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${region === 'India' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
          >
            <MapPin size={16} /> India
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.map((item) => (
          <motion.div 
            key={item.month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[32px] p-8 border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold tracking-tight">{item.month}</h3>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase">
                {item.badge}
              </span>
            </div>

            <div className="space-y-8">
              {/* Key Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Calendar size={12} /> Key Dates
                </div>
                <div className="space-y-3">
                  {item.keyDates.map((kd, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md min-w-[50px] text-center">
                        {kd.date}
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {kd.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Now */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Sparkles size={12} /> Submit Now For:
                </div>
                <ul className="space-y-2">
                  {item.submitNow.map((sn, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                      {sn}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <ImageIcon size={12} /> High-Volume Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw, idx) => (
                    <span key={idx} className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-black/5 text-gray-500'}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className={`max-w-3xl mx-auto p-8 rounded-[32px] border flex gap-6 items-start ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
        <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
          <Info size={24} />
        </div>
        <div className="space-y-4">
          <h4 className="text-xl font-bold tracking-tight">The Golden Rule of Stock Timing</h4>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Agencies like <span className="font-bold text-indigo-400">Adobe Stock</span> and <span className="font-bold text-indigo-400">Shutterstock</span> take 1-2 weeks to review content, and another 2 weeks for search engines to index your keywords.
          </p>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            To catch the "Peak Buyer Cycle", aim to have your files online exactly <span className="font-bold text-indigo-400 underline underline-offset-4">100 days before</span> the event. This gives your content time to gain popularity points before buyers start downloading.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    if (apiKey) {
      try {
        aiRef.current = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
        aiRef.current = null;
      }
    } else {
      aiRef.current = null;
    }
  }, [apiKey]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sidebar Settings
  const [targetPlatform, setTargetPlatform] = useState('Adobe Stock');
  const [fileExtension, setFileExtension] = useState('Default');
  const [imageType, setImageType] = useState('None / Auto-detect');
  const [tagsCount, setTagsCount] = useState(25);
  const [titleLength, setTitleLength] = useState(70);
  const [descriptionLength, setDescriptionLength] = useState(200);
  const [singleWordTags, setSingleWordTags] = useState(true);
  const [autoDownloadCsv, setAutoDownloadCsv] = useState(false);
  const [appMode, setAppMode] = useState<'META' | 'PROMPT'>('META');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkEditMode, setBulkEditMode] = useState<'append' | 'replace'>('append');
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState<'main' | 'calendar'>('main');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model');
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setSelectedModel(savedModel);
    else if (process.env.GEMINI_API_KEY) {
      setApiKey(process.env.GEMINI_API_KEY);
    }
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Seek to 1 second
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      video.onerror = () => resolve('');
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let uploadedFiles: File[] = [];
    if ('files' in e.target && e.target.files) {
      uploadedFiles = Array.from(e.target.files);
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      uploadedFiles = Array.from(e.dataTransfer.files);
    }

    if (uploadedFiles.length === 0) return;

    const isVector = (name: string) => /\.(eps|ai|svg)$/i.test(name);
    const isVideo = (name: string) => /\.(mp4|mov|avi|mkv|webm)$/i.test(name);
    const isImage = (name: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name);

    const newFiles: FileData[] = [];
    
    // First, identify vectors and try to find matching previews in the same upload batch
    const vectorFiles = uploadedFiles.filter(f => isVector(f.name));
    const otherFiles = uploadedFiles.filter(f => !isVector(f.name));

    for (const file of vectorFiles) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      // Look for an image with the same base name
      const previewIdx = otherFiles.findIndex(f => isImage(f.name) && f.name.substring(0, f.name.lastIndexOf('.')) === baseName);
      
      let previewFile: File | undefined;
      if (previewIdx !== -1) {
        previewFile = otherFiles.splice(previewIdx, 1)[0];
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        previewFile,
        preview: previewFile ? URL.createObjectURL(previewFile) : '', // Empty if no preview yet
        title: '',
        description: '',
        keywords: '',
        category: '',
        status: 'idle',
        type: 'vector'
      });
    }

    // Process remaining files (images and videos)
    for (const file of otherFiles) {
      const type = isVideo(file.name) ? 'video' : 'image';
      
      let preview = '';
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      } else if (type === 'video') {
        preview = await generateVideoThumbnail(file);
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview,
        title: '',
        description: '',
        keywords: '',
        category: '',
        status: 'idle',
        type
      });
    }

    setFiles(prev => [...prev, ...newFiles].slice(0, 30)); // Increased limit to 30
  };

  const attachPreviewToFile = (id: string, previewFile: File) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        if (f.preview) URL.revokeObjectURL(f.preview);
        return {
          ...f,
          previewFile,
          preview: URL.createObjectURL(previewFile)
        };
      }
      return f;
    }));
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      // Revoke preview URL to avoid memory leaks
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const saveApiKey = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_model', model);
    setShowSettings(false);
  };

  const generateMetadata = async (fileId: string) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const fileData = files.find(f => f.id === fileId);
    if (!fileData) return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'generating' } : f));

    try {
      if (!aiRef.current && apiKey) {
        try {
          aiRef.current = new GoogleGenAI({ apiKey });
        } catch (e) {
          console.error("Error initializing GoogleGenAI in generateMetadata:", e);
          throw new Error("Failed to initialize AI. Please check your API Key.");
        }
      }
      
      if (!aiRef.current) {
        throw new Error("AI is not initialized. Please check your API Key.");
      }
      
      const ai = aiRef.current;
      
      let base64Data = '';
      let mimeType = '';

      if (fileData.type === 'vector') {
        if (!fileData.previewFile) {
          throw new Error('Please upload a preview image for the vector file.');
        }
        const reader = new FileReader();
        base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(fileData.previewFile!);
        });
        mimeType = fileData.previewFile.type;
      } else if (fileData.type === 'video') {
        if (!fileData.preview) {
          throw new Error('Could not generate video thumbnail.');
        }
        base64Data = fileData.preview.split(',')[1];
        mimeType = 'image/jpeg';
      } else {
        const reader = new FileReader();
        base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(fileData.file);
        });
        mimeType = fileData.file.type;
      }

      let prompt = '';
      if (appMode === 'META') {
        const typeLabel = fileData.type === 'video' ? 'video' : 'image/vector';
        prompt = `Analyze this ${typeLabel} and provide optimized microstock metadata for ${targetPlatform}. 
        Return ONLY a JSON object with four fields: 
        'title' (strictly limited to ${titleLength} characters, descriptive and keyword-rich),
        'description' (strictly limited to ${descriptionLength} characters, detailed and natural),
        'keywords' (a comma-separated string of exactly ${tagsCount} highly relevant, high-traffic microstock keywords),
        'category' (one of the following: ${MICROSTOCK_CATEGORIES.join(', ')}).
        ${singleWordTags ? "Ensure keywords are mostly single words." : ""}
        Content Type: ${imageType}.
        Do not include any other text or explanation.`;
      } else {
        prompt = `Analyze this image and generate a highly detailed, professional prompt for an AI image generator (like Midjourney, DALL-E, or Stable Diffusion) that would recreate this scene, subject, and artistic style. 
        The prompt should include details about lighting, composition, camera settings (if applicable), and artistic medium.
        Return ONLY a JSON object with four fields: 
        'title' (a short, catchy name for the prompt),
        'description' (the full, comprehensive AI generation prompt),
        'keywords' (a comma-separated string of 10-15 style keywords and technical terms used in the prompt),
        'category' (one of the following: ${MICROSTOCK_CATEGORIES.join(', ')}).
        Do not include any other text or explanation.`;
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      let result;
      try {
        result = JSON.parse(response.text || '{}');
      } catch (e) {
        // Fallback if JSON parsing fails
        const text = response.text || '';
        result = {
          title: text.match(/"title":\s*"([^"]*)"/)?.[1] || '',
          description: text.match(/"description":\s*"([^"]*)"/)?.[1] || '',
          keywords: text.match(/"keywords":\s*"([^"]*)"/)?.[1] || '',
          category: text.match(/"category":\s*"([^"]*)"/)?.[1] || ''
        };
      }
      
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        title: result.title || '', 
        description: result.description || '',
        keywords: result.keywords || '', 
        category: result.category || '',
        status: 'done' 
      } : f));
    } catch (error: any) {
      console.error("Generation error:", error);
      
      let errorMessage = 'Failed to generate metadata';
      const errorStr = error?.message || String(error);

      if (errorStr.includes('API_KEY_INVALID') || errorStr.includes('401') || errorStr.includes('403')) {
        errorMessage = 'Invalid API Key. Please check your AI Configuration settings.';
      } else if (errorStr.includes('429') || errorStr.toLowerCase().includes('quota')) {
        errorMessage = 'Rate limit exceeded or quota exhausted. Please wait a moment.';
      } else if (errorStr.includes('fetch') || errorStr.toLowerCase().includes('network') || errorStr.includes('Rpc failed') || errorStr.includes('xhr error')) {
        errorMessage = 'Network error: Failed to reach Gemini API. This might be due to a proxy, firewall, or temporary service issue.';
      } else if (errorStr.includes('500') || errorStr.includes('503')) {
        errorMessage = 'Gemini server is busy or down. Please try again in a few minutes.';
      } else if (errorStr.toLowerCase().includes('safety') || errorStr.toLowerCase().includes('blocked')) {
        errorMessage = 'Content was blocked by AI safety filters.';
      } else if (errorStr.toLowerCase().includes('model not found')) {
        errorMessage = 'The selected model is not available for your API key.';
      }

      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: 'error', 
        error: errorMessage
      } : f));
    }
  };

  const generateAll = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setIsGeneratingAll(true);
    const idleFiles = files.filter(f => f.status !== 'done');
    
    // Process in batches of 5 to balance speed and rate limits
    const batchSize = 5;
    for (let i = 0; i < idleFiles.length; i += batchSize) {
      const batch = idleFiles.slice(i, i + batchSize);
      await Promise.all(batch.map(file => generateMetadata(file.id)));
    }
    
    setIsGeneratingAll(false);
    
    if (autoDownloadCsv) {
      exportToCSV();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getFormattedFilename = (f: FileData) => {
    let baseName = f.customFilename || f.file.name;
    
    // Prioritize title-based name for completed files as requested
    if (f.status === 'done' && f.title && !f.customFilename) {
      const sanitizedTitle = f.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      const lastDotIndex = f.file.name.lastIndexOf('.');
      const ext = lastDotIndex !== -1 ? f.file.name.substring(lastDotIndex) : '';
      baseName = `${sanitizedTitle}${ext}`;
    }

    if (fileExtension === 'Default') return baseName;
    const lastDotIndex = baseName.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? baseName.substring(0, lastDotIndex) : baseName;
    const ext = fileExtension.toLowerCase();
    return `${nameWithoutExt}.${ext}`;
  };

  const getCSVData = (f: FileData) => {
    const filename = getFormattedFilename(f);
    const title = f.title.replace(/"/g, '""');
    const description = f.description.replace(/"/g, '""');
    const keywords = f.keywords.replace(/"/g, '""');
    const category = f.category.replace(/"/g, '""');

    switch (targetPlatform) {
      case 'Adobe Stock':
        return [filename, `"${title}"`, `"${keywords}"`].join(",");
      case 'Shutterstock':
        // Shutterstock: Filename, Description, Keywords, Categories
        return [filename, `"${description || title}"`, `"${keywords}"`, `"${category}"`].join(",");
      case 'Freepik':
        return [filename, `"${title}"`, `"${keywords}"`].join(",");
      case 'Pond5':
        return [filename, `"${title}"`, `"${description}"`, `"${keywords}"`].join(",");
      case 'Vecteezy':
        return [filename, `"${title}"`, `"${description}"`, `"${keywords}"`].join(",");
      default:
        return [filename, `"${title}"`, `"${description}"`, `"${keywords}"`, `"${category}"`].join(",");
    }
  };

  const getCSVHeaders = () => {
    switch (targetPlatform) {
      case 'Adobe Stock':
        return ['Filename', 'Title', 'Keywords'].join(",");
      case 'Shutterstock':
        return ['Filename', 'Description', 'Keywords', 'Categories'].join(",");
      case 'Freepik':
        return ['Filename', 'Title', 'Keywords'].join(",");
      case 'Pond5':
        return ['Filename', 'Title', 'Description', 'Keywords'].join(",");
      case 'Vecteezy':
        return ['Filename', 'Title', 'Description', 'Keywords'].join(",");
      default:
        return ['Filename', 'Title', 'Description', 'Keywords'].join(",");
    }
  };

  const exportToCSV = () => {
    if (files.length === 0) return;

    const headers = getCSVHeaders();
    const rows = files.map(f => getCSVData(f));

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `microstock_${targetPlatform.toLowerCase().replace(/\s/g, '_')}_metadata.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTXT = () => {
    if (files.length === 0) return;

    files.forEach(f => {
      const content = `Title: ${f.title}\nDescription: ${f.description}\nKeywords: ${f.keywords}\nCategory: ${f.category}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const filename = getFormattedFilename(f).split('.')[0];
      link.setAttribute("download", `${filename}_metadata.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke URL after download
      setTimeout(() => URL.revokeObjectURL(url), 100);
    });
  };

  const exportToZIP = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();

    // Add Assets (Renamed to Title)
    for (const f of files) {
      const filename = getFormattedFilename(f);
      zip.file(filename, f.file);
      
      // If it's a vector, also add the preview image
      if (f.type === 'vector' && f.previewFile) {
        const baseName = filename.substring(0, filename.lastIndexOf('.'));
        const previewExt = f.previewFile.name.substring(f.previewFile.name.lastIndexOf('.'));
        zip.file(`${baseName}${previewExt}`, f.previewFile);
      }
    }

    // Add CSV
    const headers = getCSVHeaders();
    const rows = files.map(f => getCSVData(f));
    const csvContent = [headers, ...rows].join("\n");
    zip.file("metadata.csv", csvContent);

    // Add TXT files
    files.forEach(f => {
      const content = `Title: ${f.title}\nDescription: ${f.description}\nKeywords: ${f.keywords}\nCategory: ${f.category}`;
      const filename = getFormattedFilename(f).split('.')[0];
      zip.file(`${filename}.txt`, content);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "microstock_assets_bundle.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke URL after download
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadIndividualCSV = (fileId: string) => {
    const f = files.find(file => file.id === fileId);
    if (!f) return;

    const headers = getCSVHeaders();
    const row = getCSVData(f);

    const csvContent = [headers, row].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = getFormattedFilename(f).split('.')[0];
    link.setAttribute("download", `${filename}_metadata.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke URL after download
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const selectAllFiles = () => {
    setSelectedFileIds(files.map(f => f.id));
  };

  const deselectAllFiles = () => {
    setSelectedFileIds([]);
  };

  const applyBulkKeywords = () => {
    if (!bulkKeywords.trim() && !bulkCategory) return;

    setFiles(prev => prev.map(f => {
      if (selectedFileIds.includes(f.id)) {
        let newKeywords = f.keywords;
        if (bulkKeywords.trim()) {
          if (bulkEditMode === 'replace') {
            newKeywords = bulkKeywords;
          } else {
            // Append logic: avoid duplicates and handle commas
            const existing = f.keywords.split(',').map(k => k.trim()).filter(k => k);
            const added = bulkKeywords.split(',').map(k => k.trim()).filter(k => k);
            const combined = Array.from(new Set([...existing, ...added]));
            newKeywords = combined.join(', ');
          }
        }
        
        return { 
          ...f, 
          keywords: newKeywords,
          category: bulkCategory || f.category
        };
      }
      return f;
    }));

    setShowBulkEdit(false);
    setBulkKeywords('');
    setBulkCategory('');
    setSelectedFileIds([]);
  };

  const clearAllFiles = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setSelectedFileIds([]);
  };

  const batchRenameByTitle = () => {
    setFiles(prev => prev.map(f => {
      if (f.status !== 'done' || !f.title) return f;
      
      // Sanitize title for filename
      const sanitizedTitle = f.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      const lastDotIndex = f.file.name.lastIndexOf('.');
      const ext = lastDotIndex !== -1 ? f.file.name.substring(lastDotIndex) : '';
      
      return {
        ...f,
        customFilename: `${sanitizedTitle}${ext}`
      };
    }));
  };

  const completedCount = files.filter(f => f.status === 'done').length;
  const pendingCount = files.length - completedCount;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 flex-shrink-0 border-r overflow-y-auto transition-transform duration-300 transform
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:block
        ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-black/5'}
      `}>
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between md:hidden mb-4">
            <div 
              onClick={() => setView('main')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">MetaGen</span>
            </div>
            <button 
              onClick={() => setShowSidebar(false)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}
            >
              <X size={20} />
            </button>
          </div>
          {/* Theme Toggle */}
          <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
            <button onClick={() => setIsDarkMode(false)} className={`flex-1 py-2 rounded-lg flex justify-center ${!isDarkMode ? 'bg-white shadow-sm' : 'text-gray-500'}`}><Sun size={18} /></button>
            <button className={`flex-1 py-2 rounded-lg flex justify-center text-gray-500`}><Monitor size={18} /></button>
            <button onClick={() => setIsDarkMode(true)} className={`flex-1 py-2 rounded-lg flex justify-center ${isDarkMode ? 'bg-[#1a1a1a] shadow-sm' : 'text-gray-500'}`}><Moon size={18} /></button>
          </div>

          {/* Home Page Card */}
          <div 
            onClick={() => {
              setView('main');
              setShowSidebar(false);
            }} 
            className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${view === 'main' ? 'bg-indigo-600/10 border-indigo-500/50' : isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Home size={20} /></div>
                <div>
                  <p className="font-bold text-sm">Home Page</p>
                  <p className="text-[10px] text-gray-500">Back to Metadata Generator</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">→</div>
            </div>
          </div>

          {/* AI Config Card */}
          <div onClick={() => setShowSettings(true)} className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Settings size={20} /></div>
                <div>
                  <p className="font-bold text-sm">AI Configuration</p>
                  <p className="text-[10px] text-gray-500">Manage Keys & Providers</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">+</div>
            </div>
          </div>

          {/* Content Calendar Card */}
          <div 
            onClick={() => {
              setView('calendar');
              setShowSidebar(false);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${view === 'calendar' ? 'bg-indigo-600/10 border-indigo-500/50' : isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Calendar size={20} /></div>
                <div>
                  <p className="font-bold text-sm">Content Calendar</p>
                  <p className="text-[10px] text-gray-500">Plan Your Uploads</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">→</div>
            </div>
          </div>

          {/* Target Platform */}
          {appMode === 'META' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <Sparkles size={12} /> Target Platform
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Adobe Stock', 'Shutterstock', 'Freepik', 'Pond5', 'Vecteezy', 'Generic CSV'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setTargetPlatform(p)}
                    className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-all ${targetPlatform === p ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Extension */}
          {appMode === 'META' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <ImageIcon size={12} /> File Extension Name
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['Default', 'JPG', 'JPEG', 'PNG', 'EPS', 'AI', 'MP4', 'SVG'].map(e => (
                  <button 
                    key={e}
                    onClick={() => setFileExtension(e)}
                    className={`py-2 rounded-xl text-[10px] font-bold transition-all ${fileExtension === e ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Optimization */}
          {appMode === 'META' && (
            <div className="space-y-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Metadata Optimization</div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Image Type</label>
                <select 
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                  className={`w-full p-3 rounded-xl text-xs font-medium outline-none border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-black/5'}`}
                >
                  <option>None / Auto-detect</option>
                  <option>Photo</option>
                  <option>Illustration</option>
                  <option>Vector</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tags Count</label>
                  <span className="text-xs font-bold text-indigo-400">{tagsCount}</span>
                </div>
                <input type="range" min="5" max="50" value={tagsCount} onChange={(e) => setTagsCount(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Title Length</label>
                  <span className="text-xs font-bold text-indigo-400">{titleLength}</span>
                </div>
                <input type="range" min="10" max="199" value={titleLength} onChange={(e) => setTitleLength(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Description Length</label>
                  <span className="text-xs font-bold text-indigo-400">{descriptionLength}</span>
                </div>
                <input type="range" min="50" max="500" value={descriptionLength} onChange={(e) => setDescriptionLength(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 font-bold text-xs">T</div>
                  <span className="text-sm font-bold">Single-Word Tags</span>
                </div>
                <button 
                  onClick={() => setSingleWordTags(!singleWordTags)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${singleWordTags ? 'bg-indigo-600' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${singleWordTags ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Auto Download CSV */}
          {appMode === 'META' && (
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400"><Download size={16} /></div>
                <span className="text-sm font-bold">Auto Download CSV</span>
              </div>
              <button 
                onClick={() => setAutoDownloadCsv(!autoDownloadCsv)}
                className={`w-12 h-6 rounded-full relative transition-colors ${autoDownloadCsv ? 'bg-indigo-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoDownloadCsv ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          )}

          {/* Meta / Prompt Selector */}
          <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
            <button 
              onClick={() => setAppMode('META')}
              className={`flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all ${appMode === 'META' ? 'bg-[#1a1a1a] text-indigo-400 shadow-sm' : 'text-gray-500'}`}
            >
              <ImageIcon size={16} />
              <span className="text-[10px] font-bold">META</span>
            </button>
            <button 
              onClick={() => setAppMode('PROMPT')}
              className={`flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all ${appMode === 'PROMPT' ? 'bg-[#1a1a1a] text-indigo-400 shadow-sm' : 'text-gray-500'}`}
            >
              <Sparkles size={16} />
              <span className="text-[10px] font-bold">PROMPT</span>
            </button>
          </div>

          {/* Main Generate Button */}
          <button 
            onClick={generateAll}
            disabled={isGeneratingAll || files.length === 0}
            className="w-full py-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl"
          >
            {isGeneratingAll ? <Loader2 className="animate-spin" size={20} /> : <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />}
            {appMode === 'META' ? 'Generate Meta' : 'Generate Prompt'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className={`sticky top-0 z-40 backdrop-blur-md border-b md:hidden ${isDarkMode ? 'bg-black/50 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900'}`}
                >
                  <Menu size={20} />
                </button>
                <div 
                  onClick={() => {
                    setView('main');
                    setShowSidebar(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">MetaGen</span>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
        {view === 'main' ? (
          <>
        {/* Hero / Upload Section */}
        <section className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight"
          >
            {appMode === 'META' ? (
              <>Generate Microstock <span className="text-indigo-500">Metadata</span></>
            ) : (
              <>Generate AI <span className="text-indigo-500">Prompts</span></>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-lg mb-10 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {appMode === 'META' ? (
              "Upload your images and let AI generate optimized titles and keywords for Adobe Stock, Shutterstock, and more."
            ) : (
              "Upload your images and let AI generate detailed prompts to recreate them using Midjourney, DALL-E, or Stable Diffusion."
            )}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-6 sm:p-12 transition-all ${
              isDarkMode 
                ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50' 
                : 'border-black/10 bg-white hover:bg-gray-50 hover:border-indigo-500/50 shadow-sm'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple 
              accept="image/*,video/*,.eps,.ai" 
              className="hidden" 
            />
            <div className="flex flex-col items-center gap-8">
              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                <CloudUpload size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Upload Assets</h3>
                <p className={`text-base sm:text-lg max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Drag & drop JPG, PNG, WebP or EPS/AI files here
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                <div className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 group-hover:bg-white/10' : 'bg-gray-50 border-black/5 text-gray-600 group-hover:bg-gray-100'}`}>
                  <ImageIcon size={20} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">JPG / PNG / WebP</span>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 group-hover:bg-white/10' : 'bg-gray-50 border-black/5 text-gray-600 group-hover:bg-gray-100'}`}>
                  <FileText size={20} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">EPS / AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Actions Bar */}
        {files.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">Uploaded Files ({files.length})</h2>
                <div className="flex gap-3 mt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Done: {completedCount}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Pending: {pendingCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={selectAllFiles}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Select All
                </button>
                <button 
                  onClick={deselectAllFiles}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedFileIds.length > 0 && appMode === 'META' && (
                <button 
                  onClick={() => setShowBulkEdit(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Edit3 size={18} />
                  Bulk Edit ({selectedFileIds.length})
                </button>
              )}

              {completedCount > 0 && appMode === 'META' && (
                <button 
                  onClick={batchRenameByTitle}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    isDarkMode 
                      ? 'bg-blue-950/30 border-blue-500/30 text-blue-400 hover:bg-blue-900/40' 
                      : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Rename files based on generated titles"
                >
                  <RefreshCw size={16} />
                  Rename by Title
                </button>
              )}
              
              <button 
                onClick={clearAllFiles}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:bg-white/5' 
                    : 'bg-gray-100 border-black/5 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eraser size={16} />
                Clean
              </button>

              {appMode === 'META' && (
                <button 
                  onClick={exportToZIP}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    isDarkMode 
                      ? 'bg-orange-950/30 border-orange-500/30 text-orange-400 hover:bg-orange-900/40' 
                      : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  <FileArchive size={16} />
                  Zip (Embedded)
                </button>
              )}

              <button 
                onClick={generateAll}
                disabled={isGeneratingAll || files.every(f => f.status === 'done')}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/25"
              >
                {isGeneratingAll ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Generate All
              </button>
            </div>
          </div>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`rounded-3xl overflow-hidden border transition-all ${
                  isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5 shadow-sm'
                }`}
              >
                <div className="relative aspect-video overflow-hidden group">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <ImageIcon className="text-gray-500" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {file.type === 'vector' && !file.previewFile && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="text-orange-400" size={32} />
                        <span className="text-xs font-medium text-white">Preview Image Required</span>
                        <label className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer transition-all border border-white/20">
                          Upload Preview
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                attachPreviewToFile(file.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.id);
                    }}
                    className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                      selectedFileIds.includes(file.id) 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-black/20 border-white/40 hover:border-white'
                    }`}
                  >
                    {selectedFileIds.includes(file.id) && <Check size={14} />}
                  </div>

                  <button 
                    onClick={() => removeFile(file.id)}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                  {file.status === 'generating' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                        <span className="text-sm font-medium text-white">Generating...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Original Filename</span>
                      <span className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{file.file.name}</span>
                    </div>
                    {file.customFilename && (
                      <div className="flex flex-col items-end overflow-hidden">
                        <span className={`text-[10px] font-bold uppercase tracking-widest text-indigo-400`}>Renamed</span>
                        <span className={`text-xs truncate text-indigo-500`}>{file.customFilename}</span>
                      </div>
                    )}
                  </div>

                  {appMode === 'META' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Title
                        </label>
                        <button 
                          onClick={() => copyToClipboard(file.title)}
                          className={`p-1 rounded hover:bg-indigo-500/10 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <textarea 
                        value={file.title}
                        onChange={(e) => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, title: e.target.value } : f))}
                        placeholder="Waiting for generation..."
                        className={`w-full p-3 rounded-xl text-sm resize-none h-20 transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none ${
                          isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                        }`}
                      />
                      <div className="mt-1 flex justify-end">
                        <span className={`text-[10px] ${file.title.length > 199 ? 'text-red-500' : 'text-gray-500'}`}>
                          {file.title.length}/199
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {appMode === 'META' ? 'Description' : 'AI Generation Prompt'}
                      </label>
                      <button 
                        onClick={() => copyToClipboard(file.description)}
                        className={`p-1 rounded hover:bg-indigo-500/10 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <textarea 
                      value={file.description}
                      onChange={(e) => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, description: e.target.value } : f))}
                      placeholder={appMode === 'META' ? "Waiting for generation..." : "Full AI Prompt..."}
                      className={`w-full p-3 rounded-xl text-sm resize-none h-24 transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none ${
                        isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                      }`}
                    />
                  </div>

                  {appMode === 'META' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Keywords
                        </label>
                        <button 
                          onClick={() => copyToClipboard(file.keywords)}
                          className={`p-1 rounded hover:bg-indigo-500/10 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <textarea 
                        value={file.keywords}
                        onChange={(e) => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, keywords: e.target.value } : f))}
                        placeholder="Waiting for generation..."
                        className={`w-full p-3 rounded-xl text-sm resize-none h-24 transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none ${
                          isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                        }`}
                      />
                    </div>
                  )}

                  {appMode === 'META' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Category
                        </label>
                      </div>
                      <select 
                        value={file.category}
                        onChange={(e) => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, category: e.target.value } : f))}
                        className={`w-full p-3 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none ${
                          isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {MICROSTOCK_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 text-xs">
                      <AlertCircle size={14} />
                      <span className="flex-1 truncate">{file.error}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => generateMetadata(file.id)}
                      disabled={file.status === 'generating'}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        file.status === 'done' 
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {file.status === 'generating' ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      {file.status === 'done' ? 'Regenerate' : 'Generate'}
                    </button>
                    {file.status === 'done' && appMode === 'META' && (
                      <button 
                        onClick={() => downloadIndividualCSV(file.id)}
                        className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="Download CSV"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <ImageIcon size={64} className="mb-4 text-indigo-500" />
            <p className="text-xl font-medium">No images uploaded yet</p>
          </div>
        )}
        </>
        ) : (
          <ContentCalendar isDarkMode={isDarkMode} />
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md rounded-3xl p-8 shadow-2xl border ${isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">API Configuration</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Google Gemini API Key
                  </label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      isDarkMode ? 'bg-black/40 border border-white/10 text-white' : 'bg-gray-50 border border-black/10 text-gray-900'
                    }`}
                  />
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                    Your key is stored locally in your browser. You can get a free key from the 
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline ml-1">
                      Google AI Studio console
                    </a>.
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Preferred Model
                  </label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-black/10 text-gray-900'}`}
                  >
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Fastest)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Most Accurate)</option>
                    <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => saveApiKey(apiKey, selectedModel)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {showBulkEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkEdit(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-8 shadow-2xl border ${isDarkMode ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Bulk Edit Metadata</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Applying to {selectedFileIds.length} selected files
                  </p>
                </div>
                <button 
                  onClick={() => setShowBulkEdit(false)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className={`flex p-1 rounded-xl mb-4 ${isDarkMode ? 'bg-black/40' : 'bg-gray-100'}`}>
                    <button 
                      onClick={() => setBulkEditMode('append')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bulkEditMode === 'append' ? 'bg-[#1a1a1a] text-indigo-400 shadow-sm' : 'text-gray-500'}`}
                    >
                      Append Keywords
                    </button>
                    <button 
                      onClick={() => setBulkEditMode('replace')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bulkEditMode === 'replace' ? 'bg-[#1a1a1a] text-indigo-400 shadow-sm' : 'text-gray-500'}`}
                    >
                      Replace All
                    </button>
                  </div>

                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Keywords (comma separated)
                  </label>
                  <textarea 
                    value={bulkKeywords}
                    onChange={(e) => setBulkKeywords(e.target.value)}
                    placeholder="Enter keywords to apply..."
                    className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-32 resize-none ${
                      isDarkMode ? 'bg-black/40 border border-white/10 text-white' : 'bg-gray-50 border border-black/10 text-gray-900'
                    }`}
                  />
                  <p className="mt-3 text-[10px] text-gray-500 leading-relaxed italic">
                    {bulkEditMode === 'append' 
                      ? "Append: New keywords will be added to existing ones. Duplicates will be ignored." 
                      : "Replace: All existing keywords for selected files will be overwritten."}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Category
                  </label>
                  <select 
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none ${
                      isDarkMode ? 'bg-black/40 border border-white/10 text-white' : 'bg-gray-50 border border-black/10 text-gray-900'
                    }`}
                  >
                    <option value="">Select Category (No change)</option>
                    {MICROSTOCK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowBulkEdit(false)}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={applyBulkKeywords}
                    disabled={!bulkKeywords.trim() && !bulkCategory}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Apply to {selectedFileIds.length} Files
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`py-12 border-t mt-20 ${isDarkMode ? 'border-white/10 text-gray-500' : 'border-black/5 text-gray-400'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 MetaGen AI. Built for Microstock Contributors.</p>
        </div>
      </footer>
    </div>
    </div>
  );
}
