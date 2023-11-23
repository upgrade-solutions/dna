# frozen_string_literal: true

require_relative "dna/version"
require_relative "dna/spec/classes"
require_relative "dna/engine"
require_relative "dna/engine/import"
require_relative "dna/engine/import/document_to_hash"
require_relative "dna/engine/import/hash_to_dna_object"

module DNA
  class Error < StandardError; end
  # Your code goes here...
end
