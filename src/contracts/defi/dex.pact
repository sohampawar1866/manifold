;; Manifold DEX - Decentralized Exchange Contract
;; Automated Market Maker with Liquidity Pools
;; Version: 1.0.0

(namespace "free")

(define-keyset "free.manifold-admin" (read-keyset "manifold-admin"))

(module manifold-dex GOVERNANCE
  @doc "Manifold DEX - Automated Market Maker with Liquidity Pools"
  
  (defcap GOVERNANCE ()
    (enforce-keyset "free.manifold-admin"))
  
  (defcap SWAP (account:string token-a:string token-b:string amount-in:decimal)
    @doc "Capability for token swapping"
    (compose-capability (DEBIT account token-a))
    (compose-capability (CREDIT account token-b)))
  
  (defcap DEBIT (account:string token:string)
    @doc "Capability for debiting tokens"
    (if (= token "KDA")
        (coin.DEBIT account)
        true)) ; For other tokens, implement token-specific debit
  
  (defcap CREDIT (account:string token:string)
    @doc "Capability for crediting tokens"
    (if (= token "KDA")
        (coin.CREDIT account)
        true)) ; For other tokens, implement token-specific credit
  
  (defcap PROVIDE_LIQUIDITY (account:string token-a:string token-b:string)
    @doc "Capability for providing liquidity"
    (compose-capability (DEBIT account token-a))
    (compose-capability (DEBIT account token-b)))
  
  (defcap REMOVE_LIQUIDITY (account:string token-a:string token-b:string)
    @doc "Capability for removing liquidity"
    (compose-capability (CREDIT account token-a))
    (compose-capability (CREDIT account token-b)))

  ;; Schema Definitions
  (defschema pool-schema
    @doc "Liquidity pool information"
    token-a:string
    token-b:string
    reserve-a:decimal
    reserve-b:decimal
    total-supply:decimal
    fee-rate:decimal
    created-at:time
    last-updated:time)
  
  (defschema liquidity-schema
    @doc "Liquidity provider information"
    pool-id:string
    account:string
    lp-tokens:decimal
    token-a-amount:decimal
    token-b-amount:decimal
    created-at:time
    last-updated:time)
  
  (defschema swap-schema
    @doc "Swap transaction record"
    account:string
    token-in:string
    token-out:string
    amount-in:decimal
    amount-out:decimal
    fee:decimal
    pool-id:string
    timestamp:time)

  ;; Table Definitions
  (deftable pools:{pool-schema})
  (deftable liquidity-positions:{liquidity-schema})
  (deftable swap-history:{swap-schema})
  
  ;; Constants
  (defconst MIN_LIQUIDITY:decimal 1000.0)
  (defconst DEFAULT_FEE_RATE:decimal 0.003) ; 0.3%
  (defconst PRECISION:decimal 1000000.0)

  ;; Utility Functions
  (defun create-pool-id:string (token-a:string token-b:string)
    @doc "Create unique pool identifier"
    (if (< token-a token-b)
        (format "{}-{}" [token-a token-b])
        (format "{}-{}" [token-b token-a])))
  
  (defun calculate-price:decimal (reserve-a:decimal reserve-b:decimal)
    @doc "Calculate price ratio"
    (if (= reserve-a 0.0)
        0.0
        (/ reserve-b reserve-a)))
  
  (defun calculate-swap-output:decimal (amount-in:decimal reserve-in:decimal reserve-out:decimal fee-rate:decimal)
    @doc "Calculate swap output using constant product formula"
    (let* ((amount-in-with-fee (* amount-in (- 1.0 fee-rate)))
           (numerator (* amount-in-with-fee reserve-out))
           (denominator (+ reserve-in amount-in-with-fee)))
      (/ numerator denominator)))
  
  (defun sqrt:decimal (x:decimal)
    @doc "Square root approximation using Newton's method"
    (if (<= x 0.0)
        0.0
        (let ((guess (/ x 2.0)))
          (iterate-sqrt x guess 10))))
  
  (defun iterate-sqrt:decimal (x:decimal guess:decimal iterations:integer)
    @doc "Helper function for square root calculation"
    (if (= iterations 0)
        guess
        (let ((new-guess (/ (+ guess (/ x guess)) 2.0)))
          (iterate-sqrt x new-guess (- iterations 1)))))
  
  (defun transfer-token (from:string to:string token:string amount:decimal)
    @doc "Transfer tokens between accounts"
    (if (= token "KDA")
        (coin.transfer from to amount)
        true)) ; Implement for other token standards
  
  (defun get-token-balance:decimal (account:string token:string)
    @doc "Get token balance for account"
    (if (= token "KDA")
        (coin.get-balance account)
        0.0)) ; Implement for other token standards

  ;; Core Functions
  (defun create-pool (token-a:string token-b:string initial-a:decimal initial-b:decimal account:string)
    @doc "Create a new liquidity pool"
    (require-capability (PROVIDE_LIQUIDITY account token-a token-b))
    
    (enforce (> initial-a 0.0) "Initial amount A must be positive")
    (enforce (> initial-b 0.0) "Initial amount B must be positive")
    (enforce (!= token-a token-b) "Tokens must be different")
    
    (let* ((pool-id (create-pool-id token-a token-b))
           (initial-liquidity (sqrt (* initial-a initial-b)))
           (current-time (at "block-time" (chain-data))))
      
      (enforce (> initial-liquidity MIN_LIQUIDITY) "Insufficient initial liquidity")
      
      ;; Create pool record
      (insert pools pool-id
        { "token-a": token-a
        , "token-b": token-b
        , "reserve-a": initial-a
        , "reserve-b": initial-b
        , "total-supply": initial-liquidity
        , "fee-rate": DEFAULT_FEE_RATE
        , "created-at": current-time
        , "last-updated": current-time })
      
      ;; Create initial liquidity position
      (insert liquidity-positions (format "{}-{}" [pool-id account])
        { "pool-id": pool-id
        , "account": account
        , "lp-tokens": initial-liquidity
        , "token-a-amount": initial-a
        , "token-b-amount": initial-b
        , "created-at": current-time
        , "last-updated": current-time })
      
      (format "Pool created: {} with liquidity tokens: {}" [pool-id initial-liquidity])))
  
  (defun add-liquidity (pool-id:string amount-a:decimal amount-b:decimal account:string)
    @doc "Add liquidity to existing pool"
    (with-read pools pool-id
      { "token-a" := token-a
      , "token-b" := token-b
      , "reserve-a" := reserve-a
      , "reserve-b" := reserve-b
      , "total-supply" := total-supply }
      
      (require-capability (PROVIDE_LIQUIDITY account token-a token-b))
      
      (enforce (> amount-a 0.0) "Amount A must be positive")
      (enforce (> amount-b 0.0) "Amount B must be positive")
      
      ;; Calculate optimal amounts maintaining price ratio
      (let* ((price-ratio (/ reserve-b reserve-a))
             (optimal-b (* amount-a price-ratio))
             (optimal-a (* amount-b (/ reserve-a reserve-b)))
             (actual-a (if (<= optimal-a amount-a) optimal-a amount-a))
             (actual-b (if (<= optimal-b amount-b) optimal-b amount-b))
             (liquidity-minted (* total-supply (/ actual-a reserve-a)))
             (current-time (at "block-time" (chain-data)))
             (position-key (format "{}-{}" [pool-id account])))
        
        ;; Update pool reserves
        (update pools pool-id
          { "reserve-a": (+ reserve-a actual-a)
          , "reserve-b": (+ reserve-b actual-b)
          , "total-supply": (+ total-supply liquidity-minted)
          , "last-updated": current-time })
        
        ;; Update or create liquidity position
        (with-default-read liquidity-positions position-key
          { "lp-tokens": 0.0, "token-a-amount": 0.0, "token-b-amount": 0.0 }
          { "lp-tokens" := existing-lp
          , "token-a-amount" := existing-a
          , "token-b-amount" := existing-b }
          
          (write liquidity-positions position-key
            { "pool-id": pool-id
            , "account": account
            , "lp-tokens": (+ existing-lp liquidity-minted)
            , "token-a-amount": (+ existing-a actual-a)
            , "token-b-amount": (+ existing-b actual-b)
            , "created-at": current-time
            , "last-updated": current-time }))
        
        (format "Added liquidity: {} {} and {} {}, received {} LP tokens" 
                [actual-a token-a actual-b token-b liquidity-minted]))))
  
  (defun remove-liquidity (pool-id:string lp-tokens:decimal account:string)
    @doc "Remove liquidity from pool"
    (with-read pools pool-id
      { "token-a" := token-a
      , "token-b" := token-b
      , "reserve-a" := reserve-a
      , "reserve-b" := reserve-b
      , "total-supply" := total-supply }
      
      (require-capability (REMOVE_LIQUIDITY account token-a token-b))
      
      (enforce (> lp-tokens 0.0) "LP tokens must be positive")
      
      (let* ((position-key (format "{}-{}" [pool-id account]))
             (share (/ lp-tokens total-supply))
             (amount-a (* share reserve-a))
             (amount-b (* share reserve-b))
             (current-time (at "block-time" (chain-data))))
        
        ;; Verify user has enough LP tokens
        (with-read liquidity-positions position-key
          { "lp-tokens" := user-lp-tokens }
          (enforce (>= user-lp-tokens lp-tokens) "Insufficient LP tokens"))
        
        ;; Update pool reserves
        (update pools pool-id
          { "reserve-a": (- reserve-a amount-a)
          , "reserve-b": (- reserve-b amount-b)
          , "total-supply": (- total-supply lp-tokens)
          , "last-updated": current-time })
        
        ;; Update liquidity position
        (with-read liquidity-positions position-key
          { "lp-tokens" := current-lp
          , "token-a-amount" := current-a
          , "token-b-amount" := current-b }
          
          (let ((new-lp (- current-lp lp-tokens)))
            (if (= new-lp 0.0)
                ;; Remove position if no tokens left
                (with-capability (REMOVE_LIQUIDITY account token-a token-b)
                  (delete liquidity-positions position-key))
                ;; Update position
                (update liquidity-positions position-key
                  { "lp-tokens": new-lp
                  , "token-a-amount": (- current-a amount-a)
                  , "token-b-amount": (- current-b amount-b)
                  , "last-updated": current-time }))))
        
        (format "Removed liquidity: {} {} and {} {}" [amount-a token-a amount-b token-b]))))
  
  (defun swap-exact-in (pool-id:string token-in:string amount-in:decimal min-amount-out:decimal account:string)
    @doc "Swap exact input amount for output tokens"
    (with-read pools pool-id
      { "token-a" := token-a
      , "token-b" := token-b
      , "reserve-a" := reserve-a
      , "reserve-b" := reserve-b
      , "fee-rate" := fee-rate }
      
      (enforce (or (= token-in token-a) (= token-in token-b)) "Invalid input token")
      (enforce (> amount-in 0.0) "Amount must be positive")
      
      (let* ((is-a-to-b (= token-in token-a))
             (token-out (if is-a-to-b token-b token-a))
             (reserve-in (if is-a-to-b reserve-a reserve-b))
             (reserve-out (if is-a-to-b reserve-b reserve-a))
             (amount-out (calculate-swap-output amount-in reserve-in reserve-out fee-rate))
             (fee (* amount-in fee-rate))
             (current-time (at "block-time" (chain-data))))
        
        (require-capability (SWAP account token-in token-out amount-in))
        
        (enforce (>= amount-out min-amount-out) "Insufficient output amount")
        (enforce (> amount-out 0.0) "Invalid swap output")
        
        ;; Update pool reserves
        (if is-a-to-b
            (update pools pool-id
              { "reserve-a": (+ reserve-a amount-in)
              , "reserve-b": (- reserve-b amount-out)
              , "last-updated": current-time })
            (update pools pool-id
              { "reserve-a": (- reserve-a amount-out)
              , "reserve-b": (+ reserve-b amount-in)
              , "last-updated": current-time }))
        
        ;; Record swap transaction
        (insert swap-history (format "{}-{}" [account current-time])
          { "account": account
          , "token-in": token-in
          , "token-out": token-out
          , "amount-in": amount-in
          , "amount-out": amount-out
          , "fee": fee
          , "pool-id": pool-id
          , "timestamp": current-time })
        
        (format "Swapped {} {} for {} {} (fee: {})" 
                [amount-in token-in amount-out token-out fee]))))

  ;; Query Functions
  (defun get-pool:object{pool-schema} (pool-id:string)
    @doc "Get pool information"
    (read pools pool-id))
  
  (defun get-pool-price:decimal (pool-id:string)
    @doc "Get current pool price (token-b per token-a)"
    (with-read pools pool-id
      { "reserve-a" := reserve-a, "reserve-b" := reserve-b }
      (calculate-price reserve-a reserve-b)))
  
  (defun get-swap-quote:decimal (pool-id:string token-in:string amount-in:decimal)
    @doc "Get quote for swap without executing"
    (with-read pools pool-id
      { "token-a" := token-a
      , "token-b" := token-b
      , "reserve-a" := reserve-a
      , "reserve-b" := reserve-b
      , "fee-rate" := fee-rate }
      
      (let* ((is-a-to-b (= token-in token-a))
             (reserve-in (if is-a-to-b reserve-a reserve-b))
             (reserve-out (if is-a-to-b reserve-b reserve-a)))
        (calculate-swap-output amount-in reserve-in reserve-out fee-rate))))
  
  (defun get-liquidity-position:object{liquidity-schema} (pool-id:string account:string)
    @doc "Get user's liquidity position"
    (read liquidity-positions (format "{}-{}" [pool-id account])))
  
  (defun list-pools:[object{pool-schema}] ()
    @doc "List all pools"
    (map (read pools) (keys pools)))
  
  (defun get-user-swaps:[object{swap-schema}] (account:string)
    @doc "Get user's swap history"
    (select swap-history (where "account" (= account))))
)

;; Initialize tables
(if (read-msg "init")
  [(create-table pools)
   (create-table liquidity-positions)
   (create-table swap-history)]
  [])