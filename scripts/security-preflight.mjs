import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const status = {
  pass: 0,
  warn: 0,
  fail: 0,
};

function printLine(level, message) {
  console.log(`[${level}] ${message}`);
}

function pass(message) {
  status.pass += 1;
  printLine('PASS', message);
}

function warn(message) {
  status.warn += 1;
  printLine('WARN', message);
}

function fail(message) {
  status.fail += 1;
  printLine('FAIL', message);
}

function readText(relativePath) {
  const filePath = resolve(root, relativePath);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

function checkFileContains(relativePath, snippets, contextName) {
  const content = readText(relativePath);
  if (!content) {
    fail(`${contextName}: arquivo ausente (${relativePath}).`);
    return;
  }

  const missing = snippets.filter((snippet) => !content.includes(snippet));
  if (missing.length > 0) {
    fail(
      `${contextName}: faltam trechos esperados (${missing.join(', ')}) em ${relativePath}.`
    );
    return;
  }

  pass(`${contextName}: OK (${relativePath}).`);
}

function checkTrackedEnvFiles() {
  try {
    const output = execFileSync('git', ['ls-files', '.env*'], {
      cwd: root,
      encoding: 'utf8',
    });

    const tracked = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line !== '.env.example');

    if (tracked.length > 0) {
      fail(
        `Arquivos .env versionados (remover do git): ${tracked.join(', ')}.`
      );
      return;
    }

    pass('Nenhum .env sensível está versionado.');
  } catch (error) {
    const message = String(error);
    if (message.includes('EPERM') || message.includes('EACCES')) {
      warn(
        'Não foi possível consultar git neste ambiente restrito. ' +
        'Valide manualmente com: git ls-files .env*'
      );
      return;
    }

    fail(`Não foi possível checar arquivos versionados: ${message}.`);
  }
}

function checkEnvExample() {
  const envExample = readText('.env.example');
  if (!envExample) {
    fail('Arquivo .env.example ausente.');
    return;
  }

  const requiredPlaceholders = [
    'ADMIN_SESSION_SECRET=',
    'RESERVA_PUBLIC_TOKEN_SECRET=',
    'STRIPE_SECRET_KEY=',
    'SUPABASE_SECRET_KEY=',
    'CLOUDINARY_API_SECRET=',
    'RESEND_API_KEY=',
  ];

  const missing = requiredPlaceholders.filter((item) => !envExample.includes(item));
  if (missing.length > 0) {
    fail(`.env.example incompleto. Itens ausentes: ${missing.join(', ')}.`);
    return;
  }

  pass('.env.example contém placeholders críticos.');
}

function checkGitIgnoreEnvRules() {
  const gitignore = readText('.gitignore');
  if (!gitignore) {
    fail('.gitignore ausente.');
    return;
  }

  const mustHave = ['.env*', '!.env.example'];
  const missing = mustHave.filter((entry) => !gitignore.includes(entry));
  if (missing.length > 0) {
    fail(`.gitignore sem regras de env esperadas: ${missing.join(', ')}.`);
    return;
  }

  pass('.gitignore protege envs e permite versionar apenas .env.example.');
}

function checkInsecureDevDefaults() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  let found = false;

  for (const envFile of envFiles) {
    const content = readText(envFile);
    if (!content) continue;

    const enabled = /ADMIN_ALLOW_INSECURE_DEV_DEFAULTS\s*=\s*true/i.test(content);
    if (enabled) {
      fail(`${envFile} habilita ADMIN_ALLOW_INSECURE_DEV_DEFAULTS=true.`);
      found = true;
    }
  }

  if (!found) {
    pass('ADMIN_ALLOW_INSECURE_DEV_DEFAULTS não está habilitado em env local.');
  }
}

function checkNoOpenWritePolicies(relativePath) {
  const sql = readText(relativePath);
  if (!sql) {
    fail(`Arquivo de migration ausente (${relativePath}).`);
    return;
  }

  const insecurePatterns = [
    /FOR\s+ALL\s+USING\s*\(\s*true\s*\)/i,
    /FOR\s+UPDATE\s+USING\s*\(\s*true\s*\)/i,
    /FOR\s+DELETE\s+USING\s*\(\s*true\s*\)/i,
    /FOR\s+ALL\s+WITH\s+CHECK\s*\(\s*true\s*\)/i,
    /FOR\s+UPDATE\s+WITH\s+CHECK\s*\(\s*true\s*\)/i,
  ];

  const hasInsecure = insecurePatterns.some((pattern) => pattern.test(sql));
  if (hasInsecure) {
    fail(`${relativePath} contém política RLS de escrita aberta (true).`);
    return;
  }

  pass(`${relativePath} sem políticas RLS de escrita totalmente aberta.`);
}

function run() {
  console.log('== Security Preflight ==');

  checkEnvExample();
  checkGitIgnoreEnvRules();
  checkTrackedEnvFiles();
  checkInsecureDevDefaults();

  checkFileContains(
    'src/lib/env-validation.ts',
    ['REQUIRED_ENV_PRODUCTION', 'validateCriticalServerEnv', 'NODE_ENV !== \'production\''],
    'Validação de env crítico'
  );

  checkFileContains(
    'src/app/api/admin/login/route.ts',
    ['checkAdminLoginRateLimit', 'isSameOriginRequest', 'adminLoginSchema', 'sameSite: \'strict\''],
    'Login admin protegido'
  );

  checkFileContains(
    'src/app/api/admin/logout/route.ts',
    ['isSameOriginRequest', 'sameSite: \'strict\''],
    'Logout admin protegido'
  );

  checkFileContains(
    'src/app/api/upload/route.ts',
    ['isSameOriginRequest', 'hasValidAdminSession', 'normalizePublicId', 'ALLOWED_UPLOAD_ROOTS'],
    'Upload protegido'
  );

  checkFileContains(
    'src/lib/actions/reservas.ts',
    ['checkAndConsumeReservaRateLimit', 'createReservaPublicToken', 'verifyReservaPublicToken', 'valorTotalCalculado'],
    'Reserva protegida'
  );

  checkFileContains(
    'src/app/reservas/confirmacao/page.tsx',
    ['token', 'getReservaPublicaById'],
    'Confirmação pública com token'
  );

  checkFileContains(
    'next.config.ts',
    [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
    ],
    'Headers globais de segurança'
  );

  checkFileContains(
    'src/app/layout.tsx',
    ['validateCriticalServerEnv'],
    'Validação no startup da aplicação'
  );

  checkFileContains(
    'src/app/api/stripe/webhook/route.ts',
    ['validateCriticalServerEnv', 'verifyStripeWebhookSignature'],
    'Webhook Stripe endurecido'
  );

  checkNoOpenWritePolicies('supabase/migration.sql');
  checkNoOpenWritePolicies('supabase/migration_completa.sql');

  if (status.warn > 0) {
    printLine('WARN', `Avisos totais: ${status.warn}.`);
  }

  if (status.fail > 0) {
    console.log(
      `\nResultado: ${status.fail} falha(s), ${status.warn} aviso(s), ${status.pass} check(s) OK.`
    );
    process.exit(1);
  }

  console.log(
    `\nResultado: tudo certo. ${status.pass} check(s) OK, ${status.warn} aviso(s).`
  );
}

run();
