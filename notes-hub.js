// Smart Notes Hub - Comprehensive Notes Management System

function getNotesFilters() {
  const subjectFilter = $('#notesSubjectFilter');
  const chapterFilter = $('#notesChapterFilter');
  const noteTypeFilter = $('#noteTypeFilter');
  return {
    subjectId: opt(subjectFilter, 'value', ''),
    chapterId: opt(chapterFilter, 'value', ''),
    type: opt(noteTypeFilter, 'value', 'all')
  };
}

function populateChapterFilter(subjectId = '') {
  const chapterFilter = $('#notesChapterFilter');
  if (!chapterFilter) return;
  const chapters = subjectId ? state.chapters.filter(ch => ch.subjectId === subjectId) : state.chapters;
  chapterFilter.innerHTML = '<option value="">All Chapters</option>' +
    chapters.map(ch => `<option value="${ch.id}">${escapeHTML(ch.name)}</option>`).join('');
}

function renderSmartNotesHub() {
  const subjectFilter = $('#notesSubjectFilter');
  const noteTypeFilter = $('#noteTypeFilter');

  if (subjectFilter) {
    subjectFilter.innerHTML = '<option value="">All Subjects</option>' +
      state.subjects.map(s => `<option value="${s.id}">${escapeHTML(s.name)}</option>`).join('');
  }

  populateChapterFilter(opt(subjectFilter, 'value', ''));

  if (noteTypeFilter) {
    noteTypeFilter.innerHTML = `
      <option value="all">All Note Types</option>
      <option value="short">📝 Short Notes</option>
      <option value="detailed">📖 Detailed Notes</option>
      <option value="revision">⚡ Quick Revision</option>
    `;
  }

  const filters = getNotesFilters();
  renderNotesTree(filters);
  bindSmartNotesHubControls();
}

function renderNotesTree(filters = {}) {
  const tree = $('#notesTree');
  if (!tree) return;

  const filterSubject = filters.subjectId || '';
  const filterChapter = filters.chapterId || '';
  const filterType = filters.type || 'all';

  const topicsByChapter = (chapterId) => state.topics.filter(topic => topic.chapterId === chapterId);
  const chapterHasNotes = (chapter) => {
    return topicsByChapter(chapter.id).some(topic => topicHasNotes(topic, filterType));
  };
  const subjectHasNotes = (subject) => {
    return state.chapters.filter(ch => ch.subjectId === subject.id).some(chapter => chapterHasNotes(chapter));
  };

  let html = '';
  state.subjects.forEach(subject => {
    if (filterSubject && subject.id !== filterSubject) return;
    if (!subjectHasNotes(subject) && filterType !== 'all') return;

    const chapters = state.chapters.filter(ch => ch.subjectId === subject.id && (!filterChapter || ch.id === filterChapter));
    const chapterCount = chapters.length;

    html += `
      <div class="tree-subject" data-subject-id="${subject.id}" onclick="selectSubject(this)">
        📚 ${escapeHTML(subject.name)} <span style="font-size:11px;opacity:0.7">(${chapterCount})</span>
      </div>
    `;

    chapters.forEach(chapter => {
      if (filterType !== 'all' && !chapterHasNotes(chapter)) return;
      const topics = topicsByChapter(chapter.id).filter(topic => filterType === 'all' || topicHasNotes(topic, filterType));
      const topicCount = topics.length;
      if (!topicCount) return;

      html += `
        <div class="tree-chapter" data-chapter-id="${chapter.id}" onclick="selectChapter(this)">
          📖 ${escapeHTML(chapter.name)} <span style="font-size:11px;opacity:0.7">(${topicCount})</span>
        </div>
      `;

      topics.forEach(topic => {
        html += `
          <div class="tree-topic" data-topic-id="${topic.id}" onclick="selectTopic(this, '${topic.id}')">
            📌 ${escapeHTML(topic.name)}
          </div>
        `;
      });
    });
  });

  tree.innerHTML = html || '<p style="padding:16px;color:var(--soft);text-align:center;">No matching notes yet</p>';
}

function topicHasNotes(topic, type) {
  return state.notes.some(note => note.topicId === topic.id && (type === 'all' || note.type === type));
}

function selectSubject(el) {
  $$('.tree-subject').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  renderSubjectNotes(el.dataset.subjectId);
}

function selectChapter(el) {
  $$('.tree-chapter').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  renderChapterNotes(el.dataset.chapterId);
}

function selectTopic(el, topicId) {
  $$('.tree-topic').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  renderTopicNotes(topicId);
}

function renderSubjectNotes(subjectId) {
  const notes = state.notes.filter(n => n.subjectId === subjectId);
  const subject = state.subjects.find(s => s.id === subjectId);
  
  const viewer = $('#noteViewer');
  if (!viewer) return;

  if (!notes.length) {
    viewer.innerHTML = `
      <div class="empty-note-state">
        <p>No notes for ${escapeHTML((subject && subject.name) || 'this subject')} yet</p>
      </div>
    `;
    return;
  }

  let html = `<div class="note-content"><h2 style="font-family:'Playfair Display',serif;margin:0 0 20px;color:#f0c5ff;">📚 ${escapeHTML(subject.name)} - All Notes</h2>`;
  
  notes.forEach(note => {
    html += generateNoteCard(note);
  });

  html += '</div>';
  viewer.innerHTML = html;
}

function renderChapterNotes(chapterId) {
  const chapter = state.chapters.find(c => c.id === chapterId);
  const topics = state.topics.filter(t => t.chapterId === chapterId);
  
  const viewer = $('#noteViewer');
  if (!viewer) return;

  let html = `<div class="note-content"><h2 style="font-family:'Playfair Display',serif;margin:0 0 20px;color:#f0c5ff;">📖 ${escapeHTML(chapter.name)}</h2>`;

  if (!topics.length) {
    viewer.innerHTML = `<div class="empty-note-state"><p>No topics in this chapter</p></div>`;
    return;
  }

  topics.forEach(topic => {
    const notes = state.notes.filter(n => n.topicId === topic.id);
    if (notes.length > 0) {
      html += `<div style="margin-bottom:20px;"><h3 style="font-family:'Poppins',sans-serif;color:#b8e6d8;margin:0 0 12px;">${escapeHTML(topic.name)}</h3>`;
      notes.forEach(note => {
        html += generateNoteCard(note);
      });
      html += '</div>';
    }
  });

  html += '</div>';
  viewer.innerHTML = html || '<div class="empty-note-state"><p>No notes in this chapter</p></div>';
}

function renderTopicNotes(topicId) {
  const topic = state.topics.find(t => t.id === topicId);
  const notes = state.notes.filter(n => n.topicId === topicId);
  
  const viewer = $('#noteViewer');
  if (!viewer) return;

  if (!notes.length) {
    viewer.innerHTML = `
      <div class="empty-note-state">
        <p>No notes for ${escapeHTML((topic && topic.name) || 'this topic')} yet</p>
        <p style="font-size:12px;margin-top:10px;color:var(--muted);">Create comprehensive notes with short notes, detailed content, and quick revision</p>
      </div>
    `;
    return;
  }

  let html = `<div class="note-content"><h2 style="font-family:'Playfair Display',serif;margin:0 0 20px;color:#f0c5ff;">📌 ${escapeHTML(topic.name)}</h2>`;

  const types = ['short', 'detailed', 'revision'];
  types.forEach(type => {
    const typeNotes = notes.filter(n => n.type === type);
    if (typeNotes.length > 0) {
      const typeLabel = type === 'short' ? '📝 Short Notes' : type === 'detailed' ? '📚 Detailed Notes' : '⚡ Quick Revision';
      html += `<div style="margin-bottom:16px;"><h3 style="font-family:'Space Grotesk',sans-serif;color:#69d3b5;margin:0 0 12px;text-transform:uppercase;font-size:12px;">${typeLabel}</h3>`;
      typeNotes.forEach(note => {
        html += generateNoteCard(note);
      });
      html += '</div>';
    }
  });

  html += '</div>';
  viewer.innerHTML = html;
}

function generateNoteCard(note) {
  const typeIcons = { short: '📝', detailed: '📚', revision: '⚡' };
  const typeLabels = { short: 'Short', detailed: 'Detailed', revision: 'Quick Revision' };
  const attachmentHtml = note.attachment ? `
      <div class="note-attachment">
        <strong>Attachment:</strong> ${escapeHTML(note.attachment.name)}
        <span>${escapeHTML((note.attachment.type || 'text/plain').split('/').pop())}</span>
      </div>
    ` : '';

  return `
    <div class="note-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:12px;color:#b8e6d8;font-family:'Space Grotesk',sans-serif;font-weight:600;">${typeIcons[note.type] || '📝'} ${typeLabels[note.type] || note.type}</span>
        <span style="font-size:11px;color:var(--muted);">${new Date(note.createdAt).toLocaleDateString()}</span>
      </div>
      ${attachmentHtml}
      <div class="note-text">${generateNoteContent(note)}</div>
    </div>
  `;
}

function generateNoteContent(note) {
  const content = note.content || generateAIContent(note);
  
  // Parse and render content with diagrams
  let html = '';
  
  if (note.type === 'detailed') {
    html += `
      <div style="margin-bottom:16px;">
        <h4 style="font-family:'Roboto Slab',serif;color:#f0c5ff;margin:0 0 8px;">Overview</h4>
        <p>${note.overview || content.substring(0, 200)}...</p>
      </div>
      <div style="margin-bottom:16px;">
        <h4 style="font-family:'Roboto Slab',serif;color:#f0c5ff;margin:0 0 8px;">Key Concepts</h4>
        <ul style="margin:0;padding-left:20px;">${(note.keyConcepts || ['See detailed content']).map(k => `<li>${k}</li>`).join('')}</ul>
      </div>
    `;
    
    if (note.content) {
      html += `<div style="margin-top:16px;white-space:pre-wrap;font-family:'Fira Code',Consolas,Monaco,'Courier New',monospace;background:rgba(255,255,255,0.05);padding:16px;border-radius:16px;overflow-x:auto;"><pre>${escapeHTML(note.content)}</pre></div>`;
    }

    if (note.diagram) {
      html += `<div class="mermaid">${note.diagram}</div>`;
    }
  } else if (note.type === 'short') {
    html += `<p>${escapeHTML(content.substring(0, 300))}...</p>`;
  } else if (note.type === 'revision') {
    html += `
      <div style="background:rgba(255,173,98,0.1);padding:12px;border-radius:6px;border-left:3px solid var(--amber);">
        <p style="margin:0;font-weight:600;color:#ffe5a4;">Key Points:</p>
        <ul style="margin:8px 0 0;padding-left:20px;">${(note.keyPoints || ['Essential concept', 'Important point']).map(k => `<li>${escapeHTML(k)}</li>`).join('')}</ul>
      </div>
    `;
    if (note.content) {
      html += `<div style="margin-top:14px;white-space:pre-wrap;font-family:'Fira Code',Consolas,Monaco,'Courier New',monospace;background:rgba(255,255,255,0.05);padding:14px;border-radius:14px;overflow-x:auto;"><pre>${escapeHTML(note.content)}</pre></div>`;
    }
  }

  return html;
}

function generateAIContent(note) {
  const subject = (state.subjects.find(s => s.id === note.subjectId) || {}).name || 'General Study';
  const topic = (state.topics.find(t => t.id === note.topicId) || {}).name || 'Topic';
  const base = `${topic} in ${subject}`;
  const overview = `This note covers ${base} with clear explanations, examples, and review notes.`;

  if (note.type === 'short') {
    return `${overview} Use this quick summary to remember the main concepts.`;
  }
  if (note.type === 'revision') {
    return `Revision details for ${base}: key facts, shortcuts, and memory tips for fast review.`;
  }

  return `${overview} It explains core ideas, step-by-step examples, and important definitions to master the subject.`;
}

function autoGenerateNoteSkeleton(type, subjectId, topicId) {
  const subject = (state.subjects.find(s => s.id === subjectId) || {}).name || 'General Study';
  const topic = (state.topics.find(t => t.id === topicId) || {}).name || 'Topic';
  const codeSubject = ['Python', 'JavaScript', 'Java'].includes(subject);
  const header = `${topic} - ${subject}`;
  const description = type === 'revision'
    ? `Quick revision notes for ${topic}: focus on the main points, shortcuts, and fast recall strategies.`
    : type === 'short'
      ? `Short summary of ${topic} in ${subject}, highlighting the most important facts and ideas.`
      : `Detailed study notes for ${topic} in ${subject}, including overview, core concepts, examples, and diagram support.`;

  const overview = `Overview: ${description}`;
  const keyConcepts = [`Understand ${topic} basics`, `Connect ${topic} with ${subject}`, `Common applications`, `Revision strategy`].slice(0, type === 'revision' ? 3 : 5);
  const keyPoints = [`${topic} core idea`, `Important formula or rule`, `Typical example`, `How to practice`].slice(0, 4);
  const codeExample = codeSubject ? (
    subject === 'Python' ? `\n\nExample:\n\`\`\`python\nprint('Hello, ${topic}!')\n\`\`\`\n` :
    subject === 'JavaScript' ? `\n\nExample:\n\`\`\`javascript\nconsole.log('Hello, ${topic}!');\n\`\`\`\n` :
    `\n\nExample:\n\`\`\`java\nSystem.out.println("Hello, ${topic}!");\n\`\`\`\n`
  ) : '';
  const diagram = type === 'detailed' ? `flowchart LR\n  A[${topic}] --> B[Plan]\n  B --> C[Write Code]\n  C --> D[Test]\n  D --> E[Review]` : '';

  return {
    content: `${overview}\n\n${description}${codeExample}\nKey Concepts:\n${keyConcepts.map(c => `- ${c}`).join('\n')}\n\nKey Points:\n${keyPoints.map(p => `- ${p}`).join('\n')}`,
    overview,
    keyConcepts,
    keyPoints,
    diagram
  };
}

function parseAttachmentText(file, text) {
  const cleanedText = text.replace(/\r\n/g, '\n').trim();
  const headingMatches = [...cleanedText.matchAll(/^#{1,6}\s*(.+)$/gm)].map(match => match[1].trim());
  const mermaidMatch = cleanedText.match(/```mermaid\s*\n([\s\S]*?)\n```/i);
  const mermaidDiagram = mermaidMatch ? mermaidMatch[1].trim() : '';
  const paragraphs = cleanedText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const overview = paragraphs[0] || cleanedText.substring(0, 180);
  const keyConcepts = headingMatches.length ? headingMatches.slice(0, 5) : paragraphs.slice(1, 3).map(p => p.split(/[\.\?\!]/).shift().trim()).filter(Boolean);
  const bulletPoints = [...cleanedText.matchAll(/^(?:[-*+]\s+)(.+)$/gm)].map(match => match[1].trim());
  const keyPoints = bulletPoints.length ? bulletPoints.slice(0, 6) : (paragraphs[1] ? paragraphs[1].split(/[\.\?\!]/).slice(0, 4).map(s => s.trim()).filter(Boolean) : []);
  const content = paragraphs.slice(0, 4).join('\n\n') || cleanedText;

  return {
    attachment: {
      name: file.name,
      type: file.type || 'text/plain',
      size: file.size
    },
    content,
    overview,
    keyConcepts: keyConcepts.length ? keyConcepts : ['Extracted from attachment content'],
    keyPoints: keyPoints.length ? keyPoints : ['Extracted from attachment content'],
    diagram: mermaidDiagram
  };
}

function openAddSmartNote() {
  let attachmentPreviewResult = null;

  openModal("Create Smart Note", formShell(`
    <label>Note Type<select id="modalNoteType" name="noteType" required>
      <option value="short">📝 Short Notes (Quick Summary)</option>
      <option value="detailed">📚 Detailed Notes (In-Depth)</option>
      <option value="revision">⚡ Quick Revision (Key Points)</option>
    </select></label>
    <label>Subject<select id="modalSubjectSelect" name="subjectId" required>${options(state.subjects, state.ui.selectedSubjectId)}</select></label>
    <label>Chapter<select id="modalChapterSelect" name="chapterId" required><option value="">Select chapter</option></select></label>
    <label>Topic<select id="modalTopicSelect" name="topicId" required><option value="">Select topic</option></select></label>
    <label>Attachment<input id="modalAttachmentInput" name="attachment" type="file" accept=".txt,.md,.markdown,.json" /></label>
    <p id="modalAttachmentInfo" class="form-help">Upload a text or markdown file and the note will be auto-generated with headings, summaries, and diagrams.</p>
    <button type="button" id="modalAutoGenerate" class="primary-action">Auto-generate note</button>
    <label>Content<textarea id="modalContentTextarea" name="content" placeholder="Enter your notes here or leave blank for AI generation" rows="6"></textarea></label>
  `, "Save Note"), (data) => {
    const attachmentFile = data.get("attachment");
    const contentText = (data.get("content") || '').trim();
    const selectedType = data.get("noteType");
    const selectedSubjectId = data.get("subjectId");
    const selectedTopicId = data.get("topicId");
    const fallbackResult = !contentText && !attachmentPreviewResult ? autoGenerateNoteSkeleton(selectedType, selectedSubjectId, selectedTopicId) : null;
    const note = {
      id: uid("note"),
      type: selectedType,
      subjectId: selectedSubjectId,
      chapterId: data.get("chapterId"),
      topicId: selectedTopicId,
      content: contentText || (attachmentPreviewResult ? attachmentPreviewResult.content : '') || (fallbackResult ? fallbackResult.content : '') || '',
      createdAt: new Date().toISOString(),
      overview: (attachmentPreviewResult ? attachmentPreviewResult.overview : '') || (fallbackResult ? fallbackResult.overview : '') || '',
      keyConcepts: (attachmentPreviewResult ? attachmentPreviewResult.keyConcepts : []) || (fallbackResult ? fallbackResult.keyConcepts : []) || [],
      keyPoints: (attachmentPreviewResult ? attachmentPreviewResult.keyPoints : []) || (fallbackResult ? fallbackResult.keyPoints : []) || [],
      diagram: (attachmentPreviewResult ? attachmentPreviewResult.diagram : '') || (fallbackResult ? fallbackResult.diagram : '') || '',
      attachment: attachmentFile && attachmentFile.name ? {
        name: attachmentFile.name,
        type: attachmentFile.type,
        size: attachmentFile.size
      } : null
    };

    state.notes.push(note);
    renderSmartNotesHub();
    render();
  });

  const refreshModalTopicOptions = () => {
    const chapterSelect = $('#modalChapterSelect');
    const topicSelect = $('#modalTopicSelect');
    const chapterId = chapterSelect ? chapterSelect.value : '';
    const topics = state.topics.filter(t => t.chapterId === chapterId);
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">Select topic</option>' + options(topics, '');
    }
  };

  const refreshModalChapterOptions = () => {
    const subjectSelect = $('#modalSubjectSelect');
    const chapterSelect = $('#modalChapterSelect');
    const topicSelect = $('#modalTopicSelect');
    const selectedSubjectValue = subjectSelect ? subjectSelect.value : '';
    const subjectId = selectedSubjectValue || state.ui.selectedSubjectId || ((state.subjects[0] && state.subjects[0].id) || '');
    const chapters = state.chapters.filter(ch => ch.subjectId === subjectId);
    if (chapterSelect) {
      chapterSelect.innerHTML = '<option value="">Select chapter</option>' + options(chapters, '');
    }
    if (topicSelect) {
      const firstChapterId = (chapters[0] && chapters[0].id) || '';
      const topics = state.topics.filter(t => t.chapterId === firstChapterId);
      topicSelect.innerHTML = '<option value="">Select topic</option>' + options(topics, '');
    }
  };

  refreshModalChapterOptions();

  const modalBody = document.getElementById('modalBody');
  if (modalBody && !modalBody.dataset.smartNotesBound) {
    modalBody.addEventListener('click', (event) => {
      const target = event.target;
      if (target.id === 'modalAutoGenerate') {
        const typeSelect = $('#modalNoteType');
        const subjectSelect = $('#modalSubjectSelect');
        const topicSelect = $('#modalTopicSelect');
        const info = $('#modalAttachmentInfo');
        const contentTextarea = $('#modalContentTextarea');
        const selectedType = typeSelect ? typeSelect.value : 'detailed';
        const selectedSubjectId = subjectSelect ? subjectSelect.value : state.ui.selectedSubjectId || ((state.subjects[0] && state.subjects[0].id) || '');
        const selectedTopicId = topicSelect ? topicSelect.value : ((state.topics[0] && state.topics[0].id) || '');
        const generated = autoGenerateNoteSkeleton(selectedType, selectedSubjectId, selectedTopicId);
        attachmentPreviewResult = generated;
        if (contentTextarea) contentTextarea.value = generated.content;
        if (info) info.textContent = 'Note content generated locally. You can edit or save it as is.';
      }
    });

    modalBody.addEventListener('change', (event) => {
      const target = event.target;

      if (target.id === 'modalSubjectSelect') {
        const subjectId = target.value;
        const chapters = state.chapters.filter(ch => ch.subjectId === subjectId);
        $('#modalChapterSelect').innerHTML = '<option value="">Select chapter</option>' + options(chapters, '');
        const firstChapterId = (chapters[0] && chapters[0].id) || '';
        const topics = state.topics.filter(t => t.chapterId === firstChapterId);
        $('#modalTopicSelect').innerHTML = '<option value="">Select topic</option>' + options(topics, '');
      }

      if (target.id === 'modalChapterSelect') {
        refreshModalTopicOptions();
      }

      if (target.id === 'modalAttachmentInput') {
        const file = target.files ? target.files[0] : null;
        const info = $('#modalAttachmentInfo');
        const contentTextarea = $('#modalContentTextarea');

        if (!file) {
          if (info) info.textContent = 'Upload a text or markdown file and the note will be auto-generated with headings, summaries, and diagrams.';
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const parsed = parseAttachmentText(file, reader.result || '');
          attachmentPreviewResult = parsed;
          if (contentTextarea) contentTextarea.value = parsed.content;
          if (info) {
            info.textContent = `Loaded ${file.name}. Overview and key points have been prepared automatically.`;
          }
        };
        reader.readAsText(file);
      }
    });
    modalBody.dataset.smartNotesBound = 'true';
  }
}

// Initialize Mermaid
if (window.mermaid) {
  mermaid.initialize({ startOnLoad: true, theme: 'dark' });
}

function bindSmartNotesHubControls() {
  document.querySelectorAll('[data-action="open-add-smart-note"]').forEach((button) => {
    if (!button.dataset.smartNoteBound) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        openAddSmartNote();
      });
      button.dataset.smartNoteBound = 'true';
    }
  });
}

window.openAddSmartNote = openAddSmartNote;

function initSmartNotesHub() {
  const subjectFilter = $('#notesSubjectFilter');
  const chapterFilter = $('#notesChapterFilter');
  const typeFilter = $('#noteTypeFilter');

  if (subjectFilter) {
    subjectFilter.addEventListener('change', () => {
      populateChapterFilter(subjectFilter.value);
      renderSmartNotesHub();
    });
  }

  if (chapterFilter) {
    chapterFilter.addEventListener('change', () => {
      renderSmartNotesHub();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      renderSmartNotesHub();
    });
  }
}

const originalRender = window.render;
window.render = function() {
  originalRender.call(this);
  renderSmartNotesHub();
};

initSmartNotesHub();
bindSmartNotesHubControls();
renderSmartNotesHub();
