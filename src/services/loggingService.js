const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter: createCsvWriter } = require('csv-writer');

class LoggingService {
  constructor() {
    const logsDir = path.join(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

    this.csvWriter = createCsvWriter({
      path: path.join(logsDir, 'api_logs.csv'),
      header: [
        { id: 'request_id',   title: 'Request ID'     },
        { id: 'timestamp',    title: 'Timestamp'      },
        { id: 'model',        title: 'Model'          },
        { id: 'prompt',       title: 'Prompt'         },
        { id: 'response',     title: 'Response'       },
        { id: 'latency_ms',   title: 'Latency (ms)'   },
        { id: 'input_tokens', title: 'Input Tokens'   },
        { id: 'output_tokens',title: 'Output Tokens'  },
        { id: 'total_tokens', title: 'Total Tokens'   },
        { id: 'success',      title: 'Success'        },
        { id: 'error',        title: 'Error'          }
      ],
      append: true
    });
  }

  async logResponse(requestId, data) {
    await this.csvWriter.writeRecords([{
      request_id:    requestId,
      timestamp:     new Date().toISOString(),
      model:         data.model,
      prompt:        data.prompt  || '',
      response:      data.response|| '',
      latency_ms:    data.latency || 0,
      input_tokens:  data.inputTokens  || 0,
      output_tokens: data.outputTokens || 0,
      total_tokens:  data.totalTokens || 0,
      success:       data.success,
      error:         data.error   || ''
    }]);
  }
}

module.exports = new LoggingService();