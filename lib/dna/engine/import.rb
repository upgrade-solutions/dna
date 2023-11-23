module DNA::Engine
  module Import
    # this is a global (assuming DNA::Spec namespace) method to import data
    # from a string or file and return a DNA object
    def self.import(input_string, scope: nil)
      import_hash = DNA::Engine::Import::DocumentToHash.new(input_string: input_string)
      context = {
        scope: scope,
        input_hash: import_hash.hash
      }
      HashToDNAObject.new(context: context)
    end

    def self.import_from_file(file_path)
      import_hash = DNA::Engine::Import::FileToHash.new(file_path: file_path)
    end
  end
end

