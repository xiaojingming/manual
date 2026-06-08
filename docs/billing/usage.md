---
sidebar_position: 1
---

# Credits Usage Details

## What are CoStrict Credits?

Users cannot use advanced large language models without limits, so we adopt a quota mechanism based on Credits. Credits represent the resource quota consumed by the AI when performing tasks. In CoStrict, the following user requests will consume Credits:

- **Vibe Coding**: Intelligent code completion and generation
- **Code Review**: AI-driven code quality checks
- **Test Plans**: Analyzing project code to generate or summarize a set of executable test processes, providing quality assurance for AI
- **Documentation Generation**: Analyzing existing code to generate project knowledge bases and rules, helping AI and humans understand existing business
- **Strict Mode**: Systematically breaking down one-sentence requirements into requirement design, architecture design, test design, code design, and other steps, like setting standard procedures for AI to ensure high-quality, controllable output

Please note that the specific number of Credits consumed will vary depending on task complexity, code scale, and the specific advanced model used. For details on Credits consumption for different tasks, please refer to our Task and Credits Consumption Guide.

## How are Credits Deducted?

Credits obtained at different times have different expiration dates. The system will prioritize using the Credits that expire first to help you maximize the value of your Credits.

Even if users have exhausted their advanced model quota (i.e., Credits are depleted), we will still provide a daily limited amount of basic model call quota to ensure users can continuously use the core functions of the product.

## Free Credits Giveaway Rules

To allow users to better experience CoStrict's features, we will give away Credits for free according to the following rules:

| Network Environment | Scenario | User Type | Free Credits | Validity Period |
|---------|------|---------|-------------|--------|
| External Network | Self-registration | New User | 200 | 30 days |
| External Network | First Star | New User | 200 | 30 days |
| External Network | Invited Registration | Invited New User | 200 | 30 days |
| External Network | First Star | Invited New User | 300 | 30 days |
| External Network | Every Monday | Users who have registered and Starred | 50 | Cleared at month-end |

### Giveaway Rules Description

- **New User**: Users who register CoStrict for the first time
- **Invited New User**: New users who register through an invitation link
- **First Star**: First time giving a Star to the CoStrict project on GitHub
- **Weekly Monday Giveaway**: Automatically distribute Credits to eligible users every Monday
- **Month-end Clearance**: Credits given weekly are automatically cleared at 23:59:59 on the last day of the month

### Features of Giveaway Credits

- Giveaway Credits have lower priority than purchased Credits
- Giveaway Credits are non-transferable and non-refundable
- The system will automatically detect and distribute eligible Credits
- Giveaway records can be viewed in the Credits log

## Error Handling

Failed CoStrict model requests will not deduct Credits. Credits are only deducted when the model API call is successful and returns a valid result.

Credits will not be deducted in the following cases:

- Network connection failure
- Server internal error
- Request timeout
- Model returns error response

## Model and Credits Consumption Comparison Table

Different AI models have different performance and costs, so the Credits consumed for each call are also different. The following are the Credits consumption standards for each model:

| Model Name | Normal Period Credits Consumption | Night Period Credits Consumption | Model Features |
|---------|-------------------|-------------------|---------|
| GLM-4.5/GLM-4.6 | 1 | **0.5** 🌙 | General large language model, balancing performance and cost |
| GLM-4.6-Zhipu | 1 | **0.5** 🌙 | Zhipu AI optimized version, suitable for code generation |
| Kimi-K2-Moonshot | 10 | 10 | Moonshot high-performance model, supporting long context |
| Kimi-K2-Turbo-Moonshot | 10 | 10 | Moonshot accelerated version, faster response |
| Qwen-2.5-VL | 0.25 | 0.25 | Tongyi Qianwen visual language model, supporting image understanding |
| Auto |-|-|10% off|

### 🌙 Night Half-Price Activity

**Activity Time:** Daily 20:00 - Next day 09:00

**Participating Models:** GLM-4.5/GLM-4.6, GLM-4.6-Zhipu

**Activity Content:**

- GLM series models consume half Credits (0.5 Credits) per call during night hours
- The system will automatically determine whether it is night time based on the server time when the request is initiated
- Night half-price discounts will be separately marked in the Credits log

**Activity Description:**

- 🚨 **Limited Time Activity**: This is a limited-time promotion activity, no end time has been determined yet
- 📢 **Advance Notice**: One month before the activity ends, we will publish an end notice on the CoStrict official website (https://costrict.ai)
- ⏰ **Time Determination**: Based on server time (UTC+8 Beijing time)

### Model Selection Recommendations

- **Night Development**: It is strongly recommended to use GLM series models to enjoy half-price discounts 🌙
- **Complex Code Generation**: Use GLM-4.5/GLM-4.6 or GLM-4.6-Zhipu during the day, more cost-effective at night
- **Long Document Processing**: It is recommended to use Kimi series models, supporting long context processing
- **Multimodal Tasks**: It is recommended to use Qwen-2.5-VL, supporting image and text processing

**Note:** The Credits consumption standards for models may change according to the price adjustments of model providers. We will notify users in advance of any changes to consumption standards.

## Task and Credits Consumption Guide

Different tasks require different models, and each model has corresponding costs. To this end, we have analyzed the resource consumption of users' online activities. Based on this data, we have established the correspondence between various model uses and Credits consumption, helping users understand more clearly how we calculate and deduct Credits for different operations.

For example, a single code generation request may use an advanced large language model, consuming a certain number of input and output Tokens. The deducted Credits will be calculated based on the model used and the total amount of input and output Tokens.

When users initiate complex code review tasks, multiple advanced model calls are usually triggered in the background, so they consume more resources than simple code completion requests.

For large project documentation generation, its resource consumption will be measured based on the amount of model reasoning required to analyze the entire code base and generate corresponding documents.

| Feature Type | Basic Consumption (Small Files) | Advanced Consumption (Large Files/Projects) | Recommended Model | Night Recommendation 🌙 |
|---------|-------------------|------------------------|---------|------------|
| Vibe Coding | ~ 3 calls | ~ 5 calls | GLM-4.5/GLM-4.6, GLM-4.6-Zhipu | GLM-4.6-Zhipu (1.5-2.5) |
| Code Review | ~ 10 calls | ~ 50 calls | GLM-4.6-Zhipu | GLM-4.6-Zhipu (5-25) |
| Test Plans | ~ 80 calls | ~ 150 calls | GLM-4.5/GLM-4.6 | GLM-4.5/GLM-4.6 (40-75) |
| Documentation Generation | ~ 10 calls | ~ 80 calls | Kimi-K2-Moonshot | GLM-4.6-Zhipu (5-40) |
| Strict Mode | / | 100 ~ 500 calls | GLM-4.5/GLM-4.6 | GLM-4.5/GLM-4.6 (50-250) |

**The numbers in parentheses in the table are the estimated Credits consumption for using GLM series models at night.**

**Night Development Advantages:**

- 🌙 **Cost Savings**: Using GLM series models at night can save 50% Credits
- ⚡ **Performance Maintained**: Model performance remains unchanged, only price is discounted
- 🎯 **Suitable Scenarios**: Very suitable for night overtime work and personal learning time

**The values in the table are estimates based on statistical analysis. Actual Credits deduction will vary based on the specific model selected and usage period, and will be based on real-time usage. We are also continuously optimizing to reduce resource consumption while completing the same work.**

**Note:** In the future, as new features are launched, we may update Credits consumption rates based on their resource requirements. This means that the number of Credits deducted for certain operations may be adjusted to more accurately reflect the actual resource usage of new features.

## Usage Monitoring

You can view your Credits history and current usage in the Usage dashboard.

### View Your Credits Usage

1. Log in to the CoStrict client or visit the CoStrict official website (https://zgsm.sangfor.com/credit/manager)
2. Click on the avatar in the upper right corner, go to Settings > Usage
3. Here, you can view your current plan and information about available and used Credits in your traffic package

**Credits Usage Priority:** We will prioritize consuming Credits that expire first. For Credits with the same expiration time, they will be used in the following order:

1. Free giveaway Credits (prioritize consuming those about to expire)
2. Purchased Credits (in order of purchase time)

**Credits Expiration:**

- Purchased Credits are valid for 30 days after purchase
- Giveaway Credits validity is determined by giveaway rules (30 days or cleared at month-end)
- You can view specific expiration times in the Credits log

Credits obtained through traffic packages are always available during the validity period and will not expire early due to new purchases.

## Credits Log: Credits History and Tracking

Credits acquisition history provides a complete record of all obtained Credits, including the reason for acquisition, quantity, and effective and expiration dates, making it easy for you to track the source of Credits.

{/* ![Credits Log Example](./img/usage/image1.png) */}

### Credits Log Contains the Following Information

- **Acquisition Time**: The specific time when Credits were credited
- **Acquisition Method**: Traffic package purchase, free giveaway, activity reward, etc.
- **Credits Quantity**: The number of Credits obtained in this acquisition
- **Acquisition Source**: Specific acquisition scenarios (registration, Star, invitation, etc.)
- **Validity Period**: The expiration time of this batch of Credits
- **Remaining Quantity**: The remaining Credits of the current batch
- **Usage Records**: Detailed usage history, including the type of model used

### Important Notes About Expiration Dates

- **Purchased Credits**: The expiration date is a fixed date determined at the time of purchase (30 days after purchase)
- **Giveaway Credits**:
  - Registration and Star giveaway: 30-day validity
  - Weekly Monday giveaway: Cleared at 23:59:59 on the last day of the month
- Unlike subscription products, CoStrict's Credits validity will not change due to account changes
- All Credits are calculated according to established rules

### Usage Statistics

The Credits log not only shows the history of Credits acquisition but also provides detailed usage statistics:

- **Daily Usage**: View daily Credits consumption
- **Model Usage Distribution**: Understand the call times and Credits consumption ratio of different models
