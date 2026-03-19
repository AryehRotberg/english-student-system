interface HtmlBodyTemplateParams {
    studentName: string;
    assignment: string;
    description: string;
    portalUrl: string;
}

export const htmlBody = ({
    studentName,
    assignment,
    description,
    portalUrl,
}: HtmlBodyTemplateParams): string => `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>New Assignment</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f6f8fc;
            font-family: Verdana, Geneva, sans-serif;
            color: #111827;
        }

        .wrapper {
            width: 100%;
            padding: 24px 12px;
            box-sizing: border-box;
            background:
                radial-gradient(circle at 15% 10%, #fef3c7 0%, transparent 35%),
                radial-gradient(circle at 85% 80%, #dbeafe 0%, transparent 35%),
                #f6f8fc;
        }

        .card {
            max-width: 640px;
            margin: 0 auto;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        }

        .hero {
            padding: 28px 24px;
            background: linear-gradient(120deg, #0f766e 0%, #0ea5e9 100%);
            color: #f9fafb;
        }

        .badge {
            display: inline-block;
            font-size: 11px;
            letter-spacing: 0.7px;
            text-transform: uppercase;
            font-weight: 700;
            padding: 7px 11px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.35);
            margin-bottom: 12px;
        }

        .hero h1 {
            margin: 0;
            font-size: 26px;
            line-height: 1.25;
            font-weight: 700;
        }

        .content {
            padding: 24px;
        }

        .intro {
            margin: 0 0 18px;
            font-size: 15px;
            line-height: 1.7;
            color: #374151;
        }

        .assignment-box {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-left: 5px solid #0f766e;
            border-radius: 14px;
            padding: 18px;
            margin: 0 0 20px;
        }

        .assignment-title {
            margin: 0 0 10px;
            font-size: 18px;
            line-height: 1.4;
            font-weight: 700;
            color: #0f172a;
        }

        .assignment-description {
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: #1f2937;
            word-break: break-word;
        }

        .note {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            color: #6b7280;
        }

        .cta-wrap {
            margin: 20px 0;
            text-align: center;
        }

        .cta-btn {
            display: inline-block;
            padding: 12px 18px;
            border-radius: 10px;
            background: linear-gradient(120deg, #0f766e 0%, #0ea5e9 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        .portal-link {
            margin: 6px 0 0;
            font-size: 12px;
            color: #6b7280;
            word-break: break-all;
        }

        .portal-link a {
            color: #0369a1;
            text-decoration: none;
        }

        .footer {
            padding: 14px 24px 24px;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
        }

        @media (max-width: 560px) {
            .hero h1 {
                font-size: 21px;
            }

            .content,
            .hero,
            .footer {
                padding-left: 16px;
                padding-right: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="hero">
                <span class="badge">English Student System</span>
                <h1>You have a new assignment</h1>
            </div>

            <div class="content">
                <p class="intro">Hello ${studentName},<br/>I have assigned new work. Please review the details below and submit on time.</p>

                <div class="assignment-box">
                    <h2 class="assignment-title">${assignment}</h2>
                    <p class="assignment-description">${description}</p>
                </div>

                <div class="cta-wrap">
                    <a class="cta-btn" href="${portalUrl}">Open Student Portal</a>
                </div>

            </div>

            <div class="footer">
                This is an automated message from your learning platform.
            </div>
        </div>
    </div>
</body>
</html>`;
