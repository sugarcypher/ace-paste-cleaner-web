const crypto = require('crypto');

// Simple in-memory storage (in production, use a real database)
const users = new Map();
const sessions = new Map();

// Generate a simple token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, email, token } = JSON.parse(event.body);

    switch (action) {
      case 'signup':
        return handleSignup(email, headers);
      case 'signin':
        return handleSignin(email, headers);
      case 'verify':
        return handleVerify(token, headers);
      case 'getUsage':
        return handleGetUsage(token, headers);
      case 'recordUsage':
        return handleRecordUsage(token, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function handleSignup(email, headers) {
  if (!email || !isValidEmail(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Valid email required' })
    };
  }

  if (users.has(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email already registered' })
    };
  }

  const userId = crypto.randomUUID();
  const user = {
    id: userId,
    email,
    tier: 'free',
    createdAt: new Date().toISOString(),
    usage: {
      dailyCleanings: 0,
      totalCleanings: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    }
  };

  users.set(email, user);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      message: 'Account created successfully. You can now use the app!',
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier
      }
    })
  };
}

function handleSignin(email, headers) {
  if (!email || !isValidEmail(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Valid email required' })
    };
  }

  const user = users.get(email);
  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Email not found. Please sign up first.' })
    };
  }

  const token = generateToken();
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString()
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      token,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier
      }
    })
  };
}

function handleVerify(token, headers) {
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token required' })
    };
  }

  const session = sessions.get(token);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  const user = Array.from(users.values()).find(u => u.id === session.userId);
  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'User not found' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier
      }
    })
  };
}

function handleGetUsage(token, headers) {
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token required' })
    };
  }

  const session = sessions.get(token);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  const user = Array.from(users.values()).find(u => u.id === session.userId);
  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'User not found' })
    };
  }

  // Reset daily usage if it's a new day
  const today = new Date().toISOString().split('T')[0];
  if (user.usage.lastResetDate !== today) {
    user.usage.dailyCleanings = 0;
    user.usage.lastResetDate = today;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      usage: user.usage
    })
  };
}

function handleRecordUsage(token, headers) {
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token required' })
    };
  }

  const session = sessions.get(token);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  const user = Array.from(users.values()).find(u => u.id === session.userId);
  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'User not found' })
    };
  }

  // Reset daily usage if it's a new day
  const today = new Date().toISOString().split('T')[0];
  if (user.usage.lastResetDate !== today) {
    user.usage.dailyCleanings = 0;
    user.usage.lastResetDate = today;
  }

  // Check daily limit
  if (user.tier === 'free' && user.usage.dailyCleanings >= 3) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ 
        error: 'Daily limit reached',
        usage: user.usage
      })
    };
  }

  // Record usage
  user.usage.dailyCleanings += 1;
  user.usage.totalCleanings += 1;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      usage: user.usage
    })
  };
}
