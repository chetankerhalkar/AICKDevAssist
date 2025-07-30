# AICKStudio AI VS Code Extension

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=AICKStudio.AICKStudio-ai-vscode)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.60.0+-orange.svg)](https://code.visualstudio.com/)
[![Azure AD](https://img.shields.io/badge/Azure%20AD-Supported-blue.svg)](https://azure.microsoft.com/en-us/services/active-directory/)

**AICKStudio AI** is a comprehensive AI-powered development assistant for Visual Studio Code that integrates multiple LLM providers, company authentication, and intelligent automation tools to enhance your development workflow.

## 📽 How It Works

### 🧠 Chat with AI  
Interact with the AI in real-time for explanations, suggestions, and refactoring tips.  
![chat](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/chat-demo.gif?raw=true)
---

### 🧾 Explain Any Code  
Right-click and get detailed explanations with one click.  
![Explain Code](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/explain-code.gif?raw=true)
---

### 📚 Auto-Generate README  
Generate full project documentation in seconds.  
![Generate README](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/generate-readme.gif?raw=true)
---

### 🔁 Pull Request Assistant  
Write pull request descriptions with AI-powered insights.  
![PR Assistant](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/pr-assistant.gif?raw=true)
---

### ✅ Code Review on Demand  
Ask AI to assess selected code for bugs, performance, and best practices.  
![Code Review](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/code-review.gif?raw=true)
---

### ⚙️ Smart Settings Config  
Easily set up Azure AD, LLMs, and telemetry via the visual UI.  
![Settings Config](https://github.com/chetankerhalkar/AICKDevAssist/blob/main/settings-config.gif?raw=true)
---

## 🚀 Key Features

### 🔐 **Enterprise-Grade Authentication**
- **Azure Active Directory Integration**: Seamless company authentication with OAuth2 flow
- **Secure Token Management**: Encrypted credential storage with automatic refresh
- **Multi-Tenant Support**: Configure for your organization's specific Azure AD tenant
- **Single Sign-On (SSO)**: Leverage existing company credentials

### 🤖 **Multi-LLM Provider Support**
- **Azure OpenAI**: Enterprise-grade AI with your organization's deployment
- **OpenAI Direct**: Access to latest GPT models with direct API integration
- **Google Gemini**: Advanced multimodal AI capabilities
- **Seamless Switching**: Change providers without reconfiguration

### 💬 **Intelligent Chat Interface**
- **Modern UI**: VS Code-themed interface with responsive design
- **Real-time Interactions**: Typing indicators and smooth animations
- **Message History**: Persistent conversation tracking with export functionality
- **Code Syntax Highlighting**: Proper formatting for code snippets and technical content
- **Quick Actions**: One-click access to common AI operations

### 🛠️ **Automated Development Tools**
- **README Generator**: Intelligent project documentation creation
- **Pull Request Assistant**: Automated PR descriptions with code analysis
- **Code Explanation**: Context-aware code documentation and explanations
- **Web Search Integration**: Real-time information retrieval with Tavily API

### ⚙️ **Advanced Configuration**
- **First-Level Settings**: All configurations accessible immediately after installation
- **Visual Configuration UI**: Modern, intuitive settings interface
- **Connection Testing**: Validate provider configurations before use
- **Enterprise Integration**: Azure SQL, Weaviate, and Application Insights support

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Azure AD Authentication](#azure-ad-authentication)
  - [LLM Provider Setup](#llm-provider-setup)
  - [Advanced Settings](#advanced-settings)
- [Features](#features)
  - [Chat Interface](#chat-interface)
  - [Code Assistance](#code-assistance)
  - [Automated Tools](#automated-tools)
- [Commands](#commands)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Enterprise Features](#enterprise-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Installation

### From VS Code Marketplace

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "AICKStudio AI"
4. Click "Install"
5. Reload VS Code when prompted

### Manual Installation

1. Download the latest `.vsix` file from [Releases](https://github.com/chetankerhalkar/AICKDevAssist/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` to open Command Palette
4. Type "Extensions: Install from VSIX"
5. Select the downloaded file

## ⚡ Quick Start

### 1. Initial Configuration

After installation, AICKStudio AI will prompt you to configure your settings:

1. **Open Configuration**: Press `Ctrl+Shift+P` and run "AICKStudio AI: Configure Settings"
2. **Set Up Authentication**: Configure your Azure AD credentials (if required by your organization)
3. **Choose AI Provider**: Select and configure your preferred LLM provider
4. **Test Connection**: Verify your configuration works correctly

### 2. First Chat

1. **Open Chat**: Press `Ctrl+Shift+F` or run "AICKStudio AI: Open Chat"
2. **Start Conversation**: Type your question and press Enter
3. **Explore Features**: Try the action buttons for specialized tasks

### 3. Code Assistance

1. **Select Code**: Highlight any code in your editor
2. **Right-Click**: Choose from AICKStudio AI context menu options
3. **Get Explanations**: Use "Explain Code" for detailed analysis

## 🔐 Configuration

### Azure AD Authentication

AICKStudio AI supports enterprise authentication through Azure Active Directory, enabling secure access control and compliance with organizational policies.

#### Prerequisites

- Azure AD tenant with appropriate permissions
- Registered application in Azure AD
- Redirect URI configured for VS Code integration

#### Setup Steps

1. **Open Configuration UI**:
   ```
   Ctrl+Shift+P → "AICKStudio AI: Configure Settings"
   ```

2. **Configure Azure AD Settings**:
   - **Tenant ID**: Your organization's Azure AD tenant identifier
   - **Client ID**: Application (client) ID from Azure AD app registration
   - **Redirect URI**: `vscode://AICKStudio.AICKStudio-ai-vscode/auth`
   - **Resource URI**: Optional resource scope (e.g., Azure OpenAI endpoint)

3. **Authenticate**:
   - Click "Authenticate with Company AD"
   - Complete OAuth2 flow in your browser
   - Return to VS Code for confirmation

#### Azure AD App Registration

To set up Azure AD authentication, your IT administrator needs to:

1. **Register Application** in Azure Portal:
   - Navigate to Azure Active Directory → App registrations
   - Click "New registration"
   - Set name: "AICKStudio AI VS Code Extension"
   - Set redirect URI: `vscode://AICKStudio.AICKStudio-ai-vscode/auth`

2. **Configure Permissions**:
   - Add Microsoft Graph permissions: `User.Read`, `openid`, `profile`
   - Add Azure OpenAI permissions if using Azure OpenAI

3. **Note Configuration Values**:
   - Application (client) ID
   - Directory (tenant) ID
   - Provide these to users for configuration

### LLM Provider Setup

#### Azure OpenAI

Perfect for enterprise environments with enhanced security and compliance:

```json
{
  "AICKStudioAI.llmProvider": "azure_openai",
  "AICKStudioAI.azureOpenAI.apiKey": "your-azure-openai-key",
  "AICKStudioAI.azureOpenAI.endpoint": "https://your-resource.openai.azure.com/",
  "AICKStudioAI.azureOpenAI.modelName": "gpt-4o"
}
```

**Benefits**:
- Enterprise-grade security and compliance
- Data residency control
- Integration with Azure AD
- Custom model deployments

#### OpenAI Direct

Access to the latest models with direct API integration:

```json
{
  "AICKStudioAI.llmProvider": "openai",
  "AICKStudioAI.openai.apiKey": "sk-your-openai-key",
  "AICKStudioAI.openai.modelName": "gpt-4o"
}
```

**Available Models**:
- `gpt-4o`: Latest and most capable model
- `gpt-4`: Previous generation flagship model
- `gpt-3.5-turbo`: Fast and cost-effective option

#### Google Gemini

Advanced multimodal capabilities with Google's latest AI:

```json
{
  "AICKStudioAI.llmProvider": "gemini",
  "AICKStudioAI.gemini.apiKey": "your-gemini-api-key",
  "AICKStudioAI.gemini.modelName": "gemini-pro"
}
```

**Available Models**:
- `gemini-pro`: Text and reasoning tasks
- `gemini-pro-vision`: Multimodal with image understanding

### Advanced Settings

#### Web Search Integration

Enable real-time web search capabilities:

```json
{
  "AICKStudioAI.tavily.apiKey": "tvly-your-tavily-key"
}
```

#### Telemetry and Analytics

Monitor usage and performance with Application Insights:

```json
{
  "AICKStudioAI.telemetry.instrumentationKey": "your-app-insights-key"
}
```

#### Database Integration

Connect to Azure SQL for advanced data operations:

```json
{
  "AICKStudioAI.azure.sql.server": "your-server.database.windows.net",
  "AICKStudioAI.azure.sql.database": "your-database",
  "AICKStudioAI.azure.sql.user": "your-username",
  "AICKStudioAI.azure.sql.password": "your-password"
}
```

#### Vector Database

Integrate with Weaviate for semantic search:

```json
{
  "AICKStudioAI.weaviate.host": "your-cluster.weaviate.network",
  "AICKStudioAI.weaviate.apiKey": "your-weaviate-key"
}
```

## 💬 Features

### Chat Interface

The AICKStudio AI chat interface provides a modern, intuitive way to interact with AI directly within VS Code.

#### Key Capabilities

**Natural Conversations**: Engage in context-aware discussions about your code, projects, and development challenges. The AI maintains conversation history and can reference previous exchanges for more coherent assistance.

**Code Integration**: Seamlessly discuss code snippets, architectural decisions, and implementation strategies. The chat interface automatically formats code blocks with syntax highlighting for better readability.

**Real-time Responses**: Experience immediate feedback with typing indicators and smooth animations that provide visual cues about AI processing status.

**Action Buttons**: Quick access to specialized functions:
- **Web Search**: Research current information and best practices
- **Generate README**: Create comprehensive project documentation
- **Create PR Description**: Generate detailed pull request descriptions

#### Usage Patterns

**Development Consultation**: Use the chat for architectural advice, code review suggestions, and best practice recommendations. The AI can analyze your project structure and provide contextual guidance.

**Problem Solving**: Describe bugs, errors, or implementation challenges to receive step-by-step troubleshooting assistance and solution recommendations.

**Learning and Exploration**: Ask questions about new technologies, frameworks, or programming concepts to receive detailed explanations with practical examples.

### Code Assistance

AICKStudio AI provides comprehensive code assistance features that integrate directly with your development workflow.

#### Code Explanation

Select any code snippet and receive detailed explanations that cover:

**Functionality Analysis**: Understanding what the code does, how it works, and its purpose within the larger system.

**Best Practices Review**: Identification of coding patterns, potential improvements, and adherence to industry standards.

**Complexity Assessment**: Analysis of algorithmic complexity, performance implications, and optimization opportunities.

**Documentation Generation**: Automatic creation of inline comments and documentation that explains complex logic and business rules.

#### Context Menu Integration

Right-click on selected code to access AICKStudio AI features:

- **Explain Code**: Detailed analysis and explanation
- **Edit Selection with AI**: AI-powered code modifications
- **Generate Unit Test**: Automatic test case creation
- **Code Review**: Comprehensive quality assessment
- **Generate Comments**: Intelligent documentation

#### Multi-Language Support

AICKStudio AI supports code assistance across all major programming languages:

**Web Technologies**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
**Backend Languages**: Python, Java, C#, Go, Rust, PHP
**Mobile Development**: Swift, Kotlin, Dart (Flutter)
**Data Science**: Python, R, SQL, Jupyter Notebooks
**DevOps**: Bash, PowerShell, YAML, Docker, Kubernetes

### Automated Tools

#### README Generator

The README generator analyzes your project structure and creates comprehensive documentation automatically.

**Project Analysis**: Scans your codebase to understand:
- Project structure and organization
- Dependencies and technologies used
- Entry points and main functionality
- Configuration files and build processes

**Content Generation**: Creates structured documentation including:
- Project overview and description
- Installation and setup instructions
- Usage examples and API documentation
- Contributing guidelines and license information

**Customization**: Adapts content based on:
- Project type (library, application, framework)
- Technology stack and frameworks
- Existing documentation patterns
- Industry-specific requirements

#### Pull Request Assistant

Automate the creation of detailed, professional pull request descriptions.

**Code Analysis**: Examines changes to understand:
- Modified files and their purposes
- Added, removed, or changed functionality
- Impact on existing features
- Potential breaking changes

**Description Generation**: Creates comprehensive PR descriptions with:
- Summary of changes and their rationale
- Technical implementation details
- Testing considerations and requirements
- Deployment and rollback procedures

**Quality Assurance**: Includes recommendations for:
- Code review focus areas
- Testing strategies and coverage
- Documentation updates needed
- Performance and security considerations

## 📝 Commands

### Core Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `AICKStudio AI: Open Chat` | Launch the AI chat interface | `Ctrl+Shift+F` |
| `AICKStudio AI: Ask AICKStudio AI` | Quick AI query with input box | `Ctrl+Shift+A` |
| `AICKStudio AI: Configure Settings` | Open configuration UI | - |
| `AICKStudio AI: Authenticate` | Authenticate with Azure AD | - |

### Code Assistance Commands

| Command | Description | Context |
|---------|-------------|---------|
| `AICKStudio AI: Explain Code` | Detailed code explanation | Selected text |
| `AICKStudio AI: Edit Selection with AI` | AI-powered code editing | Selected text |
| `AICKStudio AI: Generate Unit Test` | Create test cases | Selected function/class |
| `AICKStudio AI: Code Review` | Comprehensive code analysis | Selected text |
| `AICKStudio AI: Generate Comments` | Add intelligent documentation | Selected text |

### Development Tools

| Command | Description | Usage |
|---------|-------------|-------|
| `AICKStudio AI: Generate Code Documentation` | Create API docs | Project/file level |
| `AICKStudio AI: Generate Project Structure` | Scaffold new projects | Workspace |
| `AICKStudio AI: Generate Dockerfile` | Create containerization config | Project root |
| `AICKStudio AI: Generate CI/CD Pipeline` | Setup automation workflows | Repository |

### Specialized Commands

| Command | Description | Purpose |
|---------|-------------|---------|
| `AICKStudio AI: Debug Assistance` | Help with debugging | Error analysis |
| `AICKStudio AI: Performance Optimization` | Code performance review | Optimization |
| `AICKStudio AI: Security Scan` | Security vulnerability analysis | Code security |
| `AICKStudio AI: Translate Code` | Convert between languages | Code migration |

## ⌨️ Keyboard Shortcuts

### Default Shortcuts

- **Open Chat**: `Ctrl+Shift+F` (Windows/Linux), `Cmd+Shift+F` (Mac)
- **Quick Ask**: `Ctrl+Shift+A` (Windows/Linux), `Cmd+Shift+A` (Mac)

### Customization

You can customize keyboard shortcuts through VS Code settings:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Preferences: Open Keyboard Shortcuts"
3. Search for "AICKStudio AI"
4. Click the pencil icon to modify shortcuts

### Recommended Custom Shortcuts

```json
{
  "key": "ctrl+alt+e",
  "command": "AICKStudioAI.explainCode",
  "when": "editorHasSelection"
},
{
  "key": "ctrl+alt+t",
  "command": "AICKStudioAI.generateUnitTest",
  "when": "editorHasSelection"
},
{
  "key": "ctrl+alt+r",
  "command": "AICKStudioAI.codeReview",
  "when": "editorHasSelection"
}
```

## 🏢 Enterprise Features

### Security and Compliance

**Data Protection**: All communications are encrypted in transit and at rest. No code or conversations are stored on external servers without explicit configuration.

**Audit Logging**: Comprehensive logging of all AI interactions for compliance and security monitoring through Application Insights integration.

**Access Control**: Azure AD integration ensures only authorized users can access AI capabilities, with support for conditional access policies.

**Data Residency**: When using Azure OpenAI, data processing occurs within your specified Azure region, ensuring compliance with data sovereignty requirements.

### Integration Capabilities

**Azure Ecosystem**: Native integration with Azure services including:
- Azure OpenAI for AI processing
- Azure Active Directory for authentication
- Azure SQL Database for data operations
- Application Insights for telemetry and monitoring

**Development Workflow**: Seamless integration with existing development tools:
- Git integration for commit message generation
- CI/CD pipeline configuration assistance
- Docker and Kubernetes manifest generation
- API documentation automation

**Team Collaboration**: Features designed for team environments:
- Shared configuration templates
- Consistent code review standards
- Standardized documentation generation
- Real-time collaboration support

### Scalability and Performance

**Efficient Resource Usage**: Optimized for minimal impact on VS Code performance with lazy loading and efficient memory management.

**Concurrent Operations**: Support for multiple simultaneous AI operations without blocking the development environment.

**Caching and Optimization**: Intelligent caching of responses and configurations to reduce API calls and improve response times.

**Load Balancing**: Support for multiple API endpoints and automatic failover for high-availability scenarios.

## 🔧 Troubleshooting

### Common Issues

#### Authentication Problems

**Issue**: "Authentication failed" error when trying to authenticate with Azure AD.

**Solutions**:
1. Verify Azure AD configuration:
   - Check Tenant ID and Client ID are correct
   - Ensure redirect URI is properly configured
   - Confirm application permissions are granted

2. Clear stored credentials:
   ```
   Ctrl+Shift+P → "AICKStudio AI: Configure Settings" → Reset to Defaults
   ```

3. Check network connectivity:
   - Ensure access to `login.microsoftonline.com`
   - Verify corporate firewall allows OAuth2 flows
   - Test with different network if behind corporate proxy

#### LLM Provider Issues

**Issue**: "No response from LLM" or connection timeouts.

**Solutions**:
1. Test connection in configuration UI:
   - Open settings and click "Test Connection"
   - Verify API keys are valid and not expired
   - Check endpoint URLs are correct

2. Verify API quotas and limits:
   - Check your API usage against provider limits
   - Ensure billing is current for paid services
   - Monitor rate limiting and retry policies

3. Network troubleshooting:
   - Test API access from command line or browser
   - Check for proxy or firewall blocking
   - Verify DNS resolution for API endpoints

#### Performance Issues

**Issue**: Slow response times or VS Code becoming unresponsive.

**Solutions**:
1. Optimize configuration:
   - Reduce model complexity if using advanced models
   - Enable caching for repeated queries
   - Limit concurrent operations

2. Resource management:
   - Close unnecessary VS Code extensions
   - Increase VS Code memory allocation if needed
   - Monitor system resources during AI operations

3. Network optimization:
   - Use regional API endpoints when available
   - Configure appropriate timeout values
   - Consider using faster models for routine tasks

### Debug Mode

Enable debug logging for detailed troubleshooting:

```json
{
  "AICKStudioAI.debug": true
}
```

Debug logs are available in:
- VS Code Developer Console (`Help → Toggle Developer Tools`)
- Output panel (`View → Output → AICKStudio AI`)

### Getting Help



**Community Support**: Join our community forum for peer assistance and feature discussions

**Enterprise Support**: Contact info@AICKStudio.ai for enterprise-specific assistance

**Issue Reporting**: Report bugs and feature requests on [GitHub Issues](https://github.com/chetankerhalkar/AICKDevAssist/issues)

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help makes AICKStudio AI better for everyone.

### Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/chetankerhalkar/AICKDevAssist.git
   cd AICKStudioonevscode
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build Extension**:
   ```bash
   npm run compile
   ```

4. **Run in Development**:
   - Press `F5` in VS Code to launch Extension Development Host
   - Test your changes in the new VS Code window

### Contribution Guidelines

**Code Standards**: Follow TypeScript best practices and maintain consistency with existing codebase. Use ESLint and Prettier for code formatting.

**Testing**: Add unit tests for new features and ensure existing tests pass. Integration tests should cover user-facing functionality.

**Documentation**: Update README and inline documentation for any new features or changes to existing functionality.

**Pull Requests**: 
- Create feature branches from `main`
- Write clear commit messages describing changes
- Include tests and documentation updates
- Request review from maintainers

### Areas for Contribution

**Feature Development**: New AI capabilities, additional LLM providers, enhanced UI components

**Integration**: Support for additional development tools, cloud services, and enterprise systems

**Performance**: Optimization of AI operations, caching improvements, resource management

**Documentation**: User guides, API documentation, troubleshooting resources

**Testing**: Automated testing, performance benchmarks, security assessments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

AICKStudio AI uses several open-source libraries and services:

- **LangChain**: MIT License
- **OpenAI SDK**: MIT License
- **Azure SDK**: MIT License
- **VS Code Extension API**: MIT License

### Commercial Use

The MIT license permits commercial use, modification, and distribution. Enterprise features and support are available through commercial licensing agreements.

---

## 🌟 Why Choose AICKStudio AI?

**Enterprise-Ready**: Built for professional development environments with enterprise-grade security, authentication, and compliance features.

**Multi-Provider Flexibility**: Support for multiple AI providers ensures you're not locked into a single vendor and can choose the best model for each task.

**Developer-Focused**: Designed by developers for developers, with deep integration into VS Code and common development workflows.

**Continuous Innovation**: Regular updates with new features, improved models, and enhanced capabilities based on user feedback and industry trends.

**Community-Driven**: Open-source foundation with active community contribution and transparent development process.

---

**Ready to transform your development workflow with AI?** Install AICKStudio AI today and experience the future of intelligent code assistance.

[Install from VS Code Marketplace](https://marketplace.visualstudio.com/manage/publishers/aickstudio/extensions/aickstudiodevassist) | [View on GitHub](https://github.com/chetankerhalkar/AICKDevAssist)

