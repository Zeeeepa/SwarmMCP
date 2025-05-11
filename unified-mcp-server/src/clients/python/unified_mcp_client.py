"""
Python client for the Unified MCP Server
"""

import json
import time
from typing import Dict, List, Optional, Any, Union, Callable
import requests
import socketio

class UnifiedMCPClient:
    """
    Python client for interacting with the Unified MCP Server
    """
    
    def __init__(self, base_url: str, api_key: Optional[str] = None, 
                 timeout: int = 30, websocket: bool = True,
                 websocket_url: Optional[str] = None):
        """
        Initialize the Unified MCP client
        
        Args:
            base_url: Base URL of the Unified MCP Server
            api_key: Optional API key for authentication
            timeout: Request timeout in seconds
            websocket: Whether to use WebSocket for real-time communication
            websocket_url: Optional WebSocket URL (defaults to base_url)
        """
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.use_websocket = websocket
        self.websocket_url = websocket_url or base_url
        
        # Setup HTTP headers
        self.headers = {
            'Content-Type': 'application/json'
        }
        
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
        
        # Setup WebSocket if enabled
        self.sio = None
        if websocket:
            self._setup_websocket()
        
        # Event handlers
        self.event_handlers = {}
    
    def _setup_websocket(self):
        """Setup WebSocket connection"""
        self.sio = socketio.Client()
        
        @self.sio.event
        def connect():
            print("Connected to Unified MCP Server via WebSocket")
        
        @self.sio.event
        def disconnect():
            print("Disconnected from Unified MCP Server WebSocket")
        
        @self.sio.event
        def task_updated(data):
            self._trigger_event('task_updated', data)
        
        @self.sio.event
        def task_deleted(data):
            self._trigger_event('task_deleted', data)
        
        @self.sio.event
        def agent_updated(data):
            self._trigger_event('agent_updated', data)
        
        # Connect to the server
        try:
            self.sio.connect(
                self.websocket_url,
                auth={'token': self.api_key},
                wait=False
            )
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            self.sio = None
    
    def on(self, event: str, handler: Callable):
        """
        Register an event handler
        
        Args:
            event: Event name
            handler: Event handler function
        """
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        
        self.event_handlers[event].append(handler)
    
    def off(self, event: str, handler: Callable):
        """
        Remove an event handler
        
        Args:
            event: Event name
            handler: Event handler function
        """
        if event not in self.event_handlers:
            return
        
        if handler in self.event_handlers[event]:
            self.event_handlers[event].remove(handler)
    
    def _trigger_event(self, event: str, *args):
        """
        Trigger an event
        
        Args:
            event: Event name
            *args: Event arguments
        """
        if event not in self.event_handlers:
            return
        
        for handler in self.event_handlers[event]:
            try:
                handler(*args)
            except Exception as e:
                print(f"Error in event handler for {event}: {e}")
    
    def _request(self, method: str, path: str, data: Optional[Dict] = None, 
                params: Optional[Dict] = None) -> Any:
        """
        Make an HTTP request to the server
        
        Args:
            method: HTTP method
            path: API path
            data: Request data
            params: Query parameters
            
        Returns:
            Response data
        """
        url = f"{self.base_url}{path}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                params=params,
                timeout=self.timeout
            )
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                error_message = f"API error: {e.response.status_code}"
                try:
                    error_data = e.response.json()
                    error_message += f" - {json.dumps(error_data)}"
                except:
                    error_message += f" - {e.response.text}"
                raise Exception(error_message)
            raise
    
    def _socket_request(self, event: str, data: Optional[Dict] = None) -> Any:
        """
        Make a WebSocket request to the server
        
        Args:
            event: Event name
            data: Request data
            
        Returns:
            Response data
        """
        if not self.sio:
            raise Exception("WebSocket is not enabled or connected")
        
        response_received = False
        response_data = None
        response_error = None
        
        def callback(response):
            nonlocal response_received, response_data, response_error
            response_received = True
            
            if response.get('success'):
                response_data = response
            else:
                response_error = response.get('error', 'Unknown error')
        
        self.sio.emit(event, data or {}, callback=callback)
        
        # Wait for response
        timeout_time = time.time() + self.timeout
        while not response_received and time.time() < timeout_time:
            time.sleep(0.1)
        
        if not response_received:
            raise Exception(f"WebSocket request timeout for event: {event}")
        
        if response_error:
            raise Exception(response_error)
        
        return response_data
    
    def health(self) -> Dict:
        """
        Check server health
        
        Returns:
            Server health information
        """
        return self._request('GET', '/health')
    
    # Agent-related methods
    
    def create_agent(self, config: Dict) -> Dict:
        """
        Create a new agent
        
        Args:
            config: Agent configuration
            
        Returns:
            Created agent
        """
        if self.sio:
            response = self._socket_request('agent:create', config)
            return response['agent']
        else:
            return self._request('POST', '/api/v1/agents', config)
    
    def get_agent(self, agent_id: str) -> Dict:
        """
        Get an agent by ID
        
        Args:
            agent_id: Agent ID
            
        Returns:
            Agent information
        """
        if self.sio:
            response = self._socket_request('agent:get', {'agentId': agent_id})
            return response['agent']
        else:
            return self._request('GET', f'/api/v1/agents/{agent_id}')
    
    def list_agents(self, filter: Optional[Dict] = None) -> List[Dict]:
        """
        List all agents
        
        Args:
            filter: Optional filter criteria
            
        Returns:
            List of agents
        """
        if self.sio:
            response = self._socket_request('agent:list', {'filter': filter})
            return response['agents']
        else:
            params = {}
            if filter:
                params['filter'] = json.dumps(filter)
            return self._request('GET', '/api/v1/agents', params=params)
    
    def update_agent(self, agent_id: str, config: Dict) -> Dict:
        """
        Update an agent
        
        Args:
            agent_id: Agent ID
            config: Updated agent configuration
            
        Returns:
            Updated agent
        """
        if self.sio:
            response = self._socket_request('agent:update', {'agentId': agent_id, 'config': config})
            return response['agent']
        else:
            return self._request('PUT', f'/api/v1/agents/{agent_id}', config)
    
    def delete_agent(self, agent_id: str) -> bool:
        """
        Delete an agent
        
        Args:
            agent_id: Agent ID
            
        Returns:
            Success status
        """
        if self.sio:
            response = self._socket_request('agent:delete', {'agentId': agent_id})
            return response['success']
        else:
            self._request('DELETE', f'/api/v1/agents/{agent_id}')
            return True
    
    def run_agent(self, agent_id: str, task: str) -> Any:
        """
        Run an agent with a task
        
        Args:
            agent_id: Agent ID
            task: Task for the agent to perform
            
        Returns:
            Task result
        """
        if self.sio:
            response = self._socket_request('agent:run', {'agentId': agent_id, 'task': task})
            return response['result']
        else:
            return self._request('POST', f'/api/v1/agents/{agent_id}/run', {'task': task})
    
    # Task-related methods
    
    def create_task(self, title: str, description: str, dependencies: List[str] = None) -> Dict:
        """
        Create a new task
        
        Args:
            title: Task title
            description: Task description
            dependencies: Optional array of task IDs this task depends on
            
        Returns:
            Created task
        """
        data = {
            'title': title,
            'description': description,
            'dependencies': dependencies or []
        }
        
        if self.sio:
            response = self._socket_request('task:create', data)
            return response['task']
        else:
            return self._request('POST', '/api/v1/tasks', data)
    
    def get_task(self, task_id: str) -> Dict:
        """
        Get a task by ID
        
        Args:
            task_id: Task ID
            
        Returns:
            Task information
        """
        if self.sio:
            response = self._socket_request('task:get', {'taskId': task_id})
            return response['task']
        else:
            return self._request('GET', f'/api/v1/tasks/{task_id}')
    
    def list_tasks(self, filter: Optional[Dict] = None) -> List[Dict]:
        """
        List all tasks
        
        Args:
            filter: Optional filter criteria
            
        Returns:
            List of tasks
        """
        if self.sio:
            response = self._socket_request('task:list', {'filter': filter})
            return response['tasks']
        else:
            params = {}
            if filter:
                params['filter'] = json.dumps(filter)
            return self._request('GET', '/api/v1/tasks', params=params)
    
    def update_task(self, task_id: str, updates: Dict) -> Dict:
        """
        Update a task
        
        Args:
            task_id: Task ID
            updates: Updates to apply
            
        Returns:
            Updated task
        """
        if self.sio:
            response = self._socket_request('task:update', {'taskId': task_id, 'updates': updates})
            return response['task']
        else:
            return self._request('PUT', f'/api/v1/tasks/{task_id}', updates)
    
    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task
        
        Args:
            task_id: Task ID
            
        Returns:
            Success status
        """
        if self.sio:
            response = self._socket_request('task:delete', {'taskId': task_id})
            return response['success']
        else:
            self._request('DELETE', f'/api/v1/tasks/{task_id}')
            return True
    
    def add_dependency(self, task_id: str, depends_on_task_id: str) -> Dict:
        """
        Add a dependency between tasks
        
        Args:
            task_id: The dependent task ID
            depends_on_task_id: The task ID that is depended on
            
        Returns:
            Updated task
        """
        if self.sio:
            response = self._socket_request('task:addDependency', {
                'taskId': task_id,
                'dependsOnTaskId': depends_on_task_id
            })
            return response['task']
        else:
            return self._request('POST', f'/api/v1/tasks/{task_id}/dependencies', {
                'dependsOnTaskId': depends_on_task_id
            })
    
    def remove_dependency(self, task_id: str, depends_on_task_id: str) -> Dict:
        """
        Remove a dependency between tasks
        
        Args:
            task_id: The dependent task ID
            depends_on_task_id: The task ID that is depended on
            
        Returns:
            Updated task
        """
        if self.sio:
            response = self._socket_request('task:removeDependency', {
                'taskId': task_id,
                'dependsOnTaskId': depends_on_task_id
            })
            return response['task']
        else:
            return self._request('DELETE', f'/api/v1/tasks/{task_id}/dependencies/{depends_on_task_id}')
    
    def get_next_task(self) -> Optional[Dict]:
        """
        Get the next available task
        
        Returns:
            Next available task or None
        """
        if self.sio:
            response = self._socket_request('task:getNext', {})
            return response['task']
        else:
            return self._request('GET', '/api/v1/tasks/next')
    
    # Tool-related methods
    
    def list_tools(self) -> List[Dict]:
        """
        List all available tools
        
        Returns:
            List of tools
        """
        if self.sio:
            response = self._socket_request('tool:list', {})
            return response['tools']
        else:
            return self._request('GET', '/api/v1/tools')
    
    def execute_tool(self, name: str, parameters: Optional[Dict] = None) -> Any:
        """
        Execute a tool
        
        Args:
            name: Tool name
            parameters: Tool parameters
            
        Returns:
            Tool execution result
        """
        if self.sio:
            response = self._socket_request('tool:execute', {
                'name': name,
                'parameters': parameters or {}
            })
            return response['result']
        else:
            return self._request('POST', f'/api/v1/tools/{name}/execute', {
                'parameters': parameters or {}
            })
    
    def close(self):
        """Close the client connection"""
        if self.sio:
            self.sio.disconnect()
            self.sio = None

