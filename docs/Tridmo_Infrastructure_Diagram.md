# Tridmo Platform Infrastructure

## 📋 Overview

This diagram shows the high-level architecture of the Tridmo platform - a furniture and interior design platform connecting brands, designers, and customers.

## 🏗️ Architecture Flow

### **User Types**
- 👤 **Designers** - Create interior designs and manage projects
- 🏢 **Brand Admins** - Manage furniture products and analytics  
- ⚙️ **Platform Admins** - System administration
- 🌐 **Public Users** - Browse furniture and designs

### **Device Access**
- 💻 **Desktop & Laptop** - Full platform access for all users
- 📱 **Mobile & Tablet** - Available for Designers and Public Users
- 🚫 **Admin Restrictions** - Brand Admins and Platform Admins require desktop/laptop (no mobile views yet)

### **System Components**
- 🌍 **Tridmo Website** - Single website with landing page and dashboard
- 🚀 **API Server** - Handles all business logic and data processing
- 🗄️ **Database** - Stores all platform data
- 🖼️ **Images Storage** - Product photos and design covers (with built-in global CDN)
- 📁 **Files Storage** - 3D furniture models and documents (with built-in global CDN)
- 📧 **Email Service** - User notifications and communications

---

## 🎨 Infrastructure Diagram

[Tridmo_Infrastructure_Diagram.mermaid](./Tridmo_Infrastructure_Diagram.mermaid)

---

## 🔄 How It Works

1. **Users** access the platform from their **Devices** (Desktop, Mobile, Tablet, Laptop)
2. **Devices** connect through the **Load Balancer**
3. **Load Balancer** routes traffic to the **Tridmo Website**
4. **Website** communicates with the **API Server** for all operations
5. **API Server** manages data in the **Database**
6. **API Server** stores files in **Cloudflare R2 Storage** (images and 3D models)
7. **API Server** sends notifications via **Email Service**
8. **Cloudflare R2** serves files globally with built-in CDN back to the **Website**

### **Device Compatibility**
- ✅ **Designers & Public Users** - Can access from any device
- ⚠️ **Brand Admins & Platform Admins** - Desktop/Laptop only (mobile admin views not implemented yet)

---

## 🎯 Key Features

- **3D Furniture Models** - Upload and manage furniture with materials and colors
- **Interior Design** - Create and visualize interior spaces
- **Brand Management** - Furniture manufacturers showcase products
- **User Roles** - Different access levels for admins, brands, and designers
- **Product Catalog** - Comprehensive furniture categorization
- **Order Management** - E-commerce functionality for furniture
- **Content Management** - Dynamic website content
- **File Management** - Cloud storage for models and images

---

## 📥 Diagram Export Options

### **Copy Mermaid Code**
Copy the mermaid code above and paste into:
- [Mermaid Live Editor](https://mermaid.live/)
- GitHub/GitLab Markdown
- Notion pages
- Documentation sites

### **Export as Image**
1. Go to [mermaid.live](https://mermaid.live/)
2. Paste the mermaid code
3. Click **Download PNG** or **Download SVG**