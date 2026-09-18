import { useState, useCallback } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Insert', description: 'Enter values to insert into the BST' }, { title: 'Search', description: 'Search for a value in the tree' }, { title: 'Delete', description: 'Remove a node and observe tree restructuring' }, { title: 'Traverse', description: 'View inorder, preorder, postorder traversals' }]
const observations = ['BST property: left child < parent < right child', 'Average search/insert/delete: O(log n), worst case O(n) for skewed trees', 'Inorder traversal of BST gives sorted sequence', 'Deletion of a node with two children: replace with inorder successor', 'Balanced BSTs (AVL, Red-Black) guarantee O(log n) operations']

class BSTNode { constructor(val) { this.val = val; this.left = null; this.right = null } }

function insertBST(root, val) {
  if (!root) return new BSTNode(val)
  if (val < root.val) root.left = insertBST(root.left, val)
  else if (val > root.val) root.right = insertBST(root.right, val)
  return root
}
function searchBST(root, val) { if (!root) return false; if (val === root.val) return true; return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val) }
function inorder(root) { if (!root) return []; return [...inorder(root.left), root.val, ...inorder(root.right)] }
function preorder(root) { if (!root) return []; return [root.val, ...preorder(root.left), ...preorder(root.right)] }

function getTreeLayout(root, x = 200, y = 30, dx = 80, depth = 0) {
  if (!root) return []
  const nodes = [{ val: root.val, x, y, depth }]
  const edges = []
  if (root.left) {
    const lx = x - dx / (depth * 0.5 + 1)
    edges.push({ x1: x, y1: y, x2: lx, y2: y + 50 })
    nodes.push(...getTreeLayout(root.left, lx, y + 50, dx * 0.6, depth + 1).filter(n => !n.x1))
    edges.push(...getTreeLayout(root.left, lx, y + 50, dx * 0.6, depth + 1).filter(n => n.x1))
  }
  if (root.right) {
    const rx = x + dx / (depth * 0.5 + 1)
    edges.push({ x1: x, y1: y, x2: rx, y2: y + 50 })
    nodes.push(...getTreeLayout(root.right, rx, y + 50, dx * 0.6, depth + 1).filter(n => !n.x1))
    edges.push(...getTreeLayout(root.right, rx, y + 50, dx * 0.6, depth + 1).filter(n => n.x1))
  }
  return [...nodes, ...edges]
}

export default function BSTOperations() {
  const { t } = useLanguage()
  const [root, setRoot] = useState(null)
  const [input, setInput] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [traversal, setTraversal] = useState('inorder')

  const insert = () => { const val = parseInt(input); if (!isNaN(val)) { setRoot(prev => insertBST(prev ? JSON.parse(JSON.stringify(prev, (k, v) => v instanceof BSTNode ? { val: v.val, left: v.left, right: v.right } : v)) : null, val)); setRoot(prev => { const newRoot = insertBST(cloneTree(prev), val); return newRoot }); setInput('') } }
  
  // Simpler approach: rebuild tree from values
  const [values, setValues] = useState([])
  const buildTree = (vals) => { let r = null; vals.forEach(v => r = insertBST(r, v)); return r }
  
  const handleInsert = () => { const val = parseInt(input); if (!isNaN(val) && !values.includes(val)) { const nv = [...values, val]; setValues(nv); setRoot(buildTree(nv)); setInput('') } }
  const handleDelete = () => { const val = parseInt(input); const nv = values.filter(v => v !== val); setValues(nv); setRoot(buildTree(nv)); setInput('') }
  const handleSearch = () => { const val = parseInt(searchVal); setSearchResult(searchBST(root, val)) }
  const handleReset = () => { setValues([]); setRoot(null); setSearchResult(null) }
  const handleRandom = () => { const nv = Array.from({ length: 7 }, () => Math.floor(Math.random() * 99) + 1); const unique = [...new Set(nv)]; setValues(unique); setRoot(buildTree(unique)) }

  const trav = traversal === 'inorder' ? inorder(root) : preorder(root)
  const layout = root ? getTreeLayout(root) : []
  const treeNodes = layout.filter(n => n.val !== undefined)
  const treeEdges = layout.filter(n => n.x1 !== undefined)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🌳 {t('BST Operations', 'BST ಕಾರ್ಯಾಚರಣೆಗಳು')}</h3>
        <div className="flex gap-2 mb-3">
          <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} placeholder="Value" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleInsert} className="bg-green-500 text-white font-bold px-3 py-2 rounded-lg text-sm">Insert</button>
          <button onClick={handleDelete} className="bg-red-500 text-white font-bold px-3 py-2 rounded-lg text-sm">Delete</button>
        </div>
        <div className="flex gap-2 mb-3">
          <input type="number" value={searchVal} onChange={e => setSearchVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleSearch} className="bg-violet-500 text-white font-bold px-3 py-2 rounded-lg text-sm">Search</button>
        </div>
        {searchResult !== null && <p className={`text-sm font-bold ${searchResult ? 'text-green-600' : 'text-red-600'}`}>{searchResult ? '✅ Found!' : '❌ Not found'}</p>}
        <div className="flex gap-2">
          <button onClick={handleRandom} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm">🎲 Random</button>
          <button onClick={handleReset} className="flex-1 bg-red-50 text-red-600 font-semibold py-2 rounded-lg text-sm">🔄 Reset</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('Traversal', 'ಅಡ್ಡಹಾಯುವಿಕೆ')}</h3>
        <div className="flex gap-2 mb-2">
          {['inorder', 'preorder'].map(tr => (
            <button key={tr} onClick={() => setTraversal(tr)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${traversal === tr ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{tr}</button>
          ))}
        </div>
        <p className="text-sm font-mono text-violet-600 bg-violet-50 p-2 rounded-lg">[{trav.join(', ')}]</p>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Tree Visualization', 'ಮರ ದೃಶ್ಯೀಕರಣ')}</h3>
      {!root ? (
        <div className="h-48 flex items-center justify-center text-gray-400"><p>{t('Insert values to build the tree', 'ಮರ ನಿರ್ಮಿಸಲು ಮೌಲ್ಯಗಳನ್ನು ಸೇರಿಸಿ')}</p></div>
      ) : (
        <svg viewBox="0 0 400 280" className="w-full h-auto bg-gradient-to-b from-violet-50 to-white rounded-lg">
          {treeEdges.map((e, i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#c4b5fd" strokeWidth="2" />)}
          {treeNodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={16} fill="#8b5cf6" stroke="white" strokeWidth="2" />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{n.val}</text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )

  return <MissionShell title={t('BST Operations', 'BST ಕಾರ್ಯಾಚರಣೆಗಳು')} titleEmoji="🌳" subject="CS" accentColor="violet" gradientFrom="from-violet-500" gradientTo="to-purple-600" steps={steps} currentStep={values.length > 0 ? 1 : 0} controls={controls} visualization={visualization} observations={observations} />
}

function cloneTree(node) { if (!node) return null; const n = new BSTNode(node.val); n.left = cloneTree(node.left); n.right = cloneTree(node.right); return n }
